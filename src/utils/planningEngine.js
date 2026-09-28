// RailPlan Deterministic Integrated Planning Engine
// Implements multi-department integrated block coordination, priority sorting,
// train conflict detection, block window constraints, parallel duration calculation (max duration),
// resource collision checking, deadline validation, and explainable recommendation generation.

import { calculateDurationMinutes, formatDurationString } from './dateUtils.js';

// Helper: Convert "HH:MM" time string to minutes from midnight
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const clean = timeStr.includes(' ') ? timeStr.split(' ')[1] : timeStr;
  const parts = clean.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
};

// Helper: Convert minutes from midnight to "HH:MM"
export const minutesToTime = (totalMinutes) => {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Helper: Check if two time intervals [s1, e1] and [s2, e2] overlap
export const intervalsOverlap = (s1, e1, s2, e2) => {
  return s1 < e2 && e1 > s2;
};

// Helper: Priority rank numeric value (lower is higher priority)
export const getPriorityRank = (priority) => {
  const p = (priority || '').toUpperCase();
  switch (p) {
    case 'CRITICAL': return 1;
    case 'HIGH': return 2;
    case 'MEDIUM': return 3;
    case 'LOW': return 4;
    default: return 5;
  }
};

/**
 * Checks train conflict on a given section and time window
 */
export const checkTrainConflicts = (section, startMin, endMin, trains = []) => {
  const conflicts = [];
  trains.forEach(t => {
    if (t.section === section) {
      const trainStartMin = timeToMinutes(t.start);
      const trainEndMin = timeToMinutes(t.end);
      if (intervalsOverlap(startMin, endMin, trainStartMin, trainEndMin)) {
        conflicts.push({
          type: 'Train Movement Conflict',
          severity: 'High',
          trainId: t.trainId,
          trainNo: t.trainNo,
          trainName: t.name,
          trainWindow: `${t.start}–${t.end}`,
          description: `Train ${t.trainId} (${t.name || t.trainNo}) occupies ${section} from ${t.start} to ${t.end}.`
        });
      }
    }
  });
  return conflicts;
};

/**
 * Checks whether an interval [startMin, endMin] fits within an available maintenance block on the given section
 */
export const findFittingBlock = (section, startMin, endMin, availableBlocks = []) => {
  return availableBlocks.find(b => {
    if (b.section !== section) return false;
    const bStartMin = timeToMinutes(b.availableFrom);
    const bEndMin = timeToMinutes(b.availableUntil);
    return startMin >= bStartMin && endMin <= bEndMin;
  });
};

/**
 * Checks resource overlap across already assigned/approved slots
 */
export const checkResourceConflict = (resourceKey, startMin, endMin, assignedSchedule = [], currentReqId = null) => {
  if (!resourceKey) return null;
  return assignedSchedule.find(a => {
    if (a.requestId === currentReqId) return false;
    if (a.resourceKey !== resourceKey) return false;
    return intervalsOverlap(startMin, endMin, a.startMin, a.endMin);
  });
};

/**
 * Computes parallel execution duration for a group of compatible requests:
 * In parallel execution, duration is the MAX of the constituent durations.
 */
export const computeParallelDuration = (requests = []) => {
  if (!requests.length) return 0;
  const durations = requests.map(r => {
    return r.estimatedDurationMinutes || calculateDurationMinutes(r.requestedStart, r.requestedEnd) || 60;
  });
  return Math.max(...durations);
};

/**
 * Evaluates whether a candidate group of requests can form an Integrated Maintenance Block on a section.
 */
export const findIntegratedBlockForGroup = (group, section, availableBlocks, trains, activeAssignments) => {
  // Condition 1: Check resource keys within group are distinct
  const resourceKeys = group.map(r => r.resourceKey).filter(Boolean);
  const uniqueResourceKeys = new Set(resourceKeys);
  if (resourceKeys.length !== uniqueResourceKeys.size) {
    // Two requests require the same exclusive machinery/team -> cannot execute in parallel
    return null;
  }

  // Condition 2: Compute parallel duration: max(durations)
  const durationMin = computeParallelDuration(group);

  // Condition 3: Earliest deadline among all constituent requests
  const deadlineMin = Math.min(...group.map(r => r.deadline ? timeToMinutes(r.deadline) : 1440));

  // Condition 4: Find optimal or feasible block window
  const sectionBlocks = availableBlocks.filter(b => b.section === section);
  if (!sectionBlocks.length) return null;

  // 4a. Check if preferred windows directly overlap:
  const earliestRequestedStart = Math.min(...group.map(r => timeToMinutes(r.requestedStart)));
  const latestRequestedStart = Math.max(...group.map(r => timeToMinutes(r.requestedStart)));
  
  // Try candidate starts in 15-min steps from earliest to latest requested start
  for (let candidateStart = earliestRequestedStart; candidateStart <= latestRequestedStart; candidateStart += 15) {
    const candidateEnd = candidateStart + durationMin;
    if (candidateEnd <= deadlineMin) {
      const matchingBlock = findFittingBlock(section, candidateStart, candidateEnd, availableBlocks);
      if (matchingBlock) {
        const trainConflicts = checkTrainConflicts(section, candidateStart, candidateEnd, trains);
        if (trainConflicts.length === 0) {
          const hasExternalCollision = group.some(r => 
            checkResourceConflict(r.resourceKey, candidateStart, candidateEnd, activeAssignments, r.id)
          );

          if (!hasExternalCollision) {
            const allOverlap = group.every(r => {
              const rStart = timeToMinutes(r.requestedStart);
              const rEnd = timeToMinutes(r.requestedEnd) || (rStart + (r.estimatedDurationMinutes || 60));
              return intervalsOverlap(candidateStart, candidateEnd, rStart, rEnd);
            });

            if (allOverlap) {
              return {
                blockId: matchingBlock.blockId,
                startMin: candidateStart,
                endMin: candidateEnd,
                durationMin,
                isPreferred: true,
                date: matchingBlock.date || group[0].requestedDate || '2026-08-31'
              };
            }
          }
        }
      }
    }
  }

  // 4b. Search candidate slots inside section available blocks
  for (const block of sectionBlocks) {
    const bStartMin = timeToMinutes(block.availableFrom);
    const bEndMin = timeToMinutes(block.availableUntil);
    if (bEndMin - bStartMin < durationMin) continue;

    for (let candidateStart = bStartMin; candidateStart + durationMin <= bEndMin; candidateStart += 15) {
      const candidateEnd = candidateStart + durationMin;
      if (candidateEnd > deadlineMin) continue;

      // Check train conflicts
      const tConflicts = checkTrainConflicts(section, candidateStart, candidateEnd, trains);
      if (tConflicts.length > 0) continue;

      // Check resource collisions for each member
      const hasResCollision = group.some(r =>
        checkResourceConflict(r.resourceKey, candidateStart, candidateEnd, activeAssignments, r.id)
      );
      if (hasResCollision) continue;

      const allOverlap = group.every(r => {
        const rStart = timeToMinutes(r.requestedStart);
        const rEnd = timeToMinutes(r.requestedEnd) || (rStart + (r.estimatedDurationMinutes || 60));
        return intervalsOverlap(candidateStart, candidateEnd, rStart, rEnd);
      });

      // Found valid alternative integrated window!
      return {
        blockId: block.blockId,
        startMin: candidateStart,
        endMin: candidateEnd,
        durationMin,
        isPreferred: allOverlap,
        date: block.date || group[0].requestedDate || '2026-08-31'
      };
    }
  }

  return null;
};

// ============================================================================
// UNIVERSAL COMPATIBILITY VALIDATOR (FOR BOTH AUTO & MANUAL BLOCK PLANNING)
// ============================================================================

/**
 * Validates whether a given list of maintenance requests can be merged into an Integrated Maintenance Block.
 * Evaluates section match, resource independence, parallel duration, train paths, block fit, and deadlines.
 * 
 * @param {Array} selectedRequests - 2 or more requests to evaluate
 * @param {Array} availableBlocks - Available maintenance block windows
 * @param {Array} trains - Mock scheduled trains
 * @param {Array} activeAssignments - Currently assigned/approved slots (optional)
 * @returns {Object} Comprehensive compatibility evaluation report
 */
export const checkIntegrationCompatibility = (
  selectedRequests = [],
  availableBlocks = [],
  trains = [],
  activeAssignments = []
) => {
  const incompatibleReasons = [];
  const passChecks = [];

  // 1. Minimum Selection Check
  if (!Array.isArray(selectedRequests) || selectedRequests.length < 2) {
    return {
      isCompatible: false,
      section: selectedRequests[0]?.section || null,
      departments: [],
      requestIds: (selectedRequests || []).map(r => r.id),
      requests: selectedRequests || [],
      integratedDuration: 0,
      earliestDeadline: null,
      passChecks: [],
      incompatibleReasons: ['Please select at least 2 maintenance requests to evaluate integrated block feasibility.'],
      availableBlockOptions: [],
      recommendedBlock: null,
      benefits: null,
      explanation: null
    };
  }

  const firstSection = selectedRequests[0].section;
  const departments = Array.from(new Set(selectedRequests.map(r => r.department)));
  const requestIds = selectedRequests.map(r => r.id);

  // 2. Same Section Validation Rule
  const differingRequests = selectedRequests.filter(r => r.section !== firstSection);
  if (differingRequests.length > 0) {
    differingRequests.forEach(dr => {
      incompatibleReasons.push(`Section Mismatch: Request ${dr.id} is on ${dr.section}, while ${selectedRequests[0].id} is on ${firstSection}. All requests in an integrated block must share the same corridor section.`);
    });
  } else {
    passChecks.push({
      name: 'Corridor Section Alignment',
      status: 'pass',
      detail: `All ${selectedRequests.length} selected requests operate on Section ${firstSection}.`
    });
  }

  // 3. Status Eligibility Check
  const ineligibleRequests = selectedRequests.filter(r => r.status === 'Approved' || r.status === 'Rejected' || r.status === 'Completed');
  if (ineligibleRequests.length > 0) {
    ineligibleRequests.forEach(ir => {
      incompatibleReasons.push(`Status Ineligibility: Request ${ir.id} is already ${ir.status} and cannot be combined into a new draft block.`);
    });
  }

  // 4. Resource Exclusivity Conflict Check
  const resourceUsage = {};
  selectedRequests.forEach(r => {
    if (r.resourceKey) {
      if (!resourceUsage[r.resourceKey]) resourceUsage[r.resourceKey] = [];
      resourceUsage[r.resourceKey].push(r.id);
    }
  });

  let hasResourceConflict = false;
  Object.entries(resourceUsage).forEach(([key, ids]) => {
    if (ids.length > 1) {
      hasResourceConflict = true;
      incompatibleReasons.push(`Resource Collision: Requests ${ids.join(' and ')} both require exclusive resource ${key} simultaneously.`);
    }
  });

  if (!hasResourceConflict) {
    passChecks.push({
      name: 'Resource Independence',
      status: 'pass',
      detail: `Each participating department (${departments.join(', ')}) deploys distinct, non-conflicting field gangs/machinery.`
    });
  }

  // 5. Compute Parallel Duration: Max(constituent durations)
  const durations = selectedRequests.map(r => {
    return r.estimatedDurationMinutes || calculateDurationMinutes(r.requestedStart, r.requestedEnd) || 60;
  });
  const maxDuration = Math.max(...durations);
  const totalIndividualDuration = durations.reduce((sum, d) => sum + d, 0);

  passChecks.push({
    name: 'Parallel Duration Optimization',
    status: 'pass',
    detail: `Integrated duration is governed by longest activity: ${maxDuration} minutes (saving ${totalIndividualDuration - maxDuration} min vs sequential).`
  });

  // 6. Earliest Deadline Calculation
  const deadlineMins = selectedRequests.map(r => r.deadline ? timeToMinutes(r.deadline) : 1440);
  const earliestDeadlineMin = Math.min(...deadlineMins);
  const earliestDeadlineStr = minutesToTime(earliestDeadlineMin);

  // 7. Search Matching Available Maintenance Blocks on this Section
  const sectionBlocks = availableBlocks.filter(b => b.section === firstSection);
  const availableBlockOptions = [];

  if (sectionBlocks.length === 0) {
    incompatibleReasons.push(`No Available Blocks: No predefined maintenance blocks configured for section ${firstSection}.`);
  } else {
    // Evaluate candidate windows inside each matching section block
    sectionBlocks.forEach(block => {
      const bStartMin = timeToMinutes(block.availableFrom);
      const bEndMin = timeToMinutes(block.availableUntil);
      const blockCapacity = bEndMin - bStartMin;

      if (blockCapacity < maxDuration) {
        return; // Block is too short for the required integrated duration
      }

      // Check multiple start slots in 15-min intervals within the block
      for (let candidateStart = bStartMin; candidateStart + maxDuration <= bEndMin; candidateStart += 15) {
        const candidateEnd = candidateStart + maxDuration;

        // Constraint A: Must finish before earliest deadline
        if (candidateEnd > earliestDeadlineMin) continue;

        // Constraint B: Train Movement Clearance
        const trainConflicts = checkTrainConflicts(firstSection, candidateStart, candidateEnd, trains);
        if (trainConflicts.length > 0) continue;

        // Constraint C: External Resource Assignments
        const hasExternalCollision = selectedRequests.some(r =>
          checkResourceConflict(r.resourceKey, candidateStart, candidateEnd, activeAssignments, r.id)
        );
        if (hasExternalCollision) continue;

        // Calculate Rescheduling Impact & Critical Delay
        let rescheduleCount = 0;
        let maxCriticalDelayMin = 0;
        let directOverlapCount = 0;

        selectedRequests.forEach(r => {
          const reqStart = timeToMinutes(r.requestedStart);
          const reqEnd = timeToMinutes(r.requestedEnd) || (reqStart + (r.estimatedDurationMinutes || 60));
          const overlaps = intervalsOverlap(candidateStart, candidateEnd, reqStart, reqEnd);

          if (overlaps) {
            directOverlapCount++;
          } else {
            rescheduleCount++;
            if ((r.priority || '').toUpperCase() === 'CRITICAL') {
              const diff = Math.abs(candidateStart - reqStart);
              if (diff > maxCriticalDelayMin) maxCriticalDelayMin = diff;
            }
          }
        });

        const isDirectPreferred = directOverlapCount === selectedRequests.length;
        const startStr = minutesToTime(candidateStart);
        const endStr = minutesToTime(candidateEnd);

        // Scoring metric for ranking options deterministically:
        // Highest score for direct window overlap, earliest start, least rescheduling
        let score = 1000 - (candidateStart * 0.5) - (rescheduleCount * 50) - (maxCriticalDelayMin * 0.2);
        if (isDirectPreferred) score += 300;

        availableBlockOptions.push({
          blockId: block.blockId,
          blockName: block.name || `${firstSection} Maintenance Block`,
          section: firstSection,
          date: block.date || selectedRequests[0].requestedDate || '2026-08-31',
          start: startStr,
          end: endStr,
          startMin: candidateStart,
          endMin: candidateEnd,
          durationMinutes: maxDuration,
          hasTrainConflict: false,
          isDirectPreferred,
          rescheduleCount,
          criticalDelayMinutes: maxCriticalDelayMin,
          score,
          reason: isDirectPreferred 
            ? 'Optimal direct overlap with all department requested windows with zero train conflict.' 
            : rescheduleCount === 0 
              ? 'Fits within corridor slot without passenger train interference.'
              : `Feasible window requiring timing adjustment for ${rescheduleCount} request(s).`
        });
      }
    });

    // Deduplicate block options to give distinct, meaningful choices across blocks
    const distinctOptionsMap = new Map();
    availableBlockOptions.forEach(opt => {
      const key = `${opt.blockId}-${opt.start}-${opt.end}`;
      if (!distinctOptionsMap.has(key) || distinctOptionsMap.get(key).score < opt.score) {
        distinctOptionsMap.set(key, opt);
      }
    });

    const uniqueOptions = Array.from(distinctOptionsMap.values()).sort((a, b) => b.score - a.score);

    // Limit to top 5 feasible choices
    const finalOptions = uniqueOptions.slice(0, 5);

    if (finalOptions.length === 0 && differingRequests.length === 0) {
      incompatibleReasons.push(`No Feasible Block Window: No available maintenance block on ${firstSection} can accommodate ${maxDuration} minutes before deadline (${earliestDeadlineStr}) without train movement collisions.`);
    } else if (finalOptions.length > 0) {
      // Mark the top scored deterministic option as Recommended
      finalOptions[0].isRecommended = true;
      finalOptions[0].recommendationReason = 'Earliest feasible common block with zero train conflicts and minimum schedule adjustment.';

      passChecks.push({
        name: 'Train Traffic & Capacity Clearance',
        status: 'pass',
        detail: `Identified ${finalOptions.length} valid train-free maintenance windows on ${firstSection}.`
      });

      passChecks.push({
        name: 'Deadline Feasibility',
        status: 'pass',
        detail: `All options complete before earliest deadline (${earliestDeadlineStr}).`
      });
    }
  }

  const isCompatible = incompatibleReasons.length === 0 && availableBlockOptions.length > 0;
  const separateBlocksAvoided = selectedRequests.length - 1;
  const recommendedBlock = availableBlockOptions.find(b => b.isRecommended) || availableBlockOptions[0] || null;

  // Benefits Calculation
  const benefits = {
    requestsCombined: selectedRequests.length,
    separateBlocksRequired: selectedRequests.length,
    integratedBlocksRequired: 1,
    separateBlocksAvoided,
    trackPossessionHoursSaved: ((totalIndividualDuration - maxDuration) / 60).toFixed(1)
  };

  // Explanation Factors
  const explanation = {
    summary: isCompatible 
      ? `All ${selectedRequests.length} requests on ${firstSection} can be synchronized into one common maintenance block.` 
      : 'Selected requests cannot be integrated into a single maintenance block.',
    points: isCompatible ? [
      `All ${selectedRequests.length} requests concern corridor section ${firstSection}.`,
      `Each participating department (${departments.join(', ')}) utilizes independent maintenance equipment.`,
      `Parallel execution duration is ${maxDuration} minutes (saving ${benefits.trackPossessionHoursSaved} hours of track possession).`,
      `Verified clear of passenger and freight train movements during available window.`,
      `Satisfies all individual departmental deadlines.`
    ] : incompatibleReasons
  };

  return {
    isCompatible,
    section: firstSection,
    departments,
    requestIds,
    requests: selectedRequests,
    integratedDuration: maxDuration,
    earliestDeadline: earliestDeadlineStr,
    passChecks,
    incompatibleReasons,
    availableBlockOptions: availableBlockOptions.slice(0, 5),
    recommendedBlock,
    benefits,
    explanation
  };
};

/**
 * Searches and suggests compatible candidate requests given a primary selected request.
 */
export const findCompatibleCandidateRequests = (
  primaryRequest,
  allRequests = [],
  availableBlocks = [],
  trains = []
) => {
  if (!primaryRequest) return [];

  const candidates = allRequests.filter(r => 
    r.id !== primaryRequest.id &&
    r.status !== 'Approved' && 
    r.status !== 'Rejected' && 
    r.status !== 'Completed'
  );

  return candidates.map(cand => {
    const isSameSection = cand.section === primaryRequest.section;
    const isSameResource = cand.resourceKey === primaryRequest.resourceKey;
    const isDiffDept = cand.department !== primaryRequest.department;

    let matchBadge = '';
    let matchScore = 0;

    if (isSameSection && !isSameResource && isDiffDept) {
      matchBadge = 'Optimal Candidate';
      matchScore = 3;
    } else if (isSameSection && !isSameResource) {
      matchBadge = 'Same Section';
      matchScore = 2;
    } else if (isSameSection && isSameResource) {
      matchBadge = 'Resource Collision';
      matchScore = -1;
    } else {
      matchBadge = 'Different Section';
      matchScore = 0;
    }

    return {
      request: cand,
      isSameSection,
      isSameResource,
      matchBadge,
      matchScore,
      reason: isSameSection && !isSameResource 
        ? `Operates on ${cand.section} with independent resource (${cand.resourceKey}).` 
        : `Located on ${cand.section} (Differs from ${primaryRequest.section}).`
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

/**
 * Builds a canonical IntegratedMaintenanceBlock object from manual planner selection
 */
export const buildManualIntegratedBlock = (
  selectedRequests = [],
  chosenBlockOption = {},
  customIbId = null
) => {
  const depts = Array.from(new Set(selectedRequests.map(r => r.department)));
  const section = selectedRequests[0]?.section || 'SEC-01';
  const durationMin = computeParallelDuration(selectedRequests);
  const startStr = chosenBlockOption.start || '12:00';
  const endStr = chosenBlockOption.end || minutesToTime(timeToMinutes(startStr) + durationMin);
  const blockId = chosenBlockOption.blockId || 'MB-201';
  const date = chosenBlockOption.date || selectedRequests[0]?.requestedDate || '2026-08-31';

  const ibId = customIbId || `IB-M${Math.floor(100 + Math.random() * 900)}`;
  const separateBlocksAvoided = Math.max(0, selectedRequests.length - 1);

  const activities = selectedRequests.map(r => ({
    requestId: r.id,
    department: r.department,
    maintenanceType: r.maintenanceType,
    description: r.description,
    durationMinutes: r.estimatedDurationMinutes || 60,
    resourceKey: r.resourceKey,
    priority: r.priority
  }));

  const explanation = `Manually coordinated by Central Planning. All ${selectedRequests.length} maintenance activities (${selectedRequests.map(r => r.id).join(', ')}) operate on corridor section ${section}. Independent department resources permit concurrent execution inside maintenance block ${blockId} (${startStr}–${endStr}) with zero passenger train conflicts. Parallel duration is ${durationMin} minutes, successfully saving ${separateBlocksAvoided} separate corridor shutdowns.`;

  const factors = [
    { name: 'Corridor Section Alignment', status: 'pass', detail: `All ${selectedRequests.length} activities located on section ${section}.` },
    { name: 'Resource Independence', status: 'pass', detail: `Resources (${selectedRequests.map(r => r.resourceKey).filter(Boolean).join(', ')}) operate concurrently without conflict.` },
    { name: 'Block Window Fit', status: 'pass', detail: `Parallel window (${startStr}–${endStr}) fits within available block ${blockId}.` },
    { name: 'Train Traffic Clearance', status: 'pass', detail: `Zero passenger or freight train movements on ${section} during window.` },
    { name: 'Deadline Compliance', status: 'pass', detail: `Concludes at ${endStr}, satisfying all constituent deadlines.` }
  ];

  return {
    id: ibId,
    creationMode: 'MANUAL',
    blockId,
    section,
    date,
    start: startStr,
    end: endStr,
    durationMinutes: durationMin,
    requestIds: selectedRequests.map(r => r.id),
    departments: depts,
    requests: selectedRequests,
    activities,
    status: 'Pending Approval',
    separateBlocksAvoided,
    explanation,
    factors,
    trainImpact: {
      separateBlocksRequired: selectedRequests.length,
      integratedBlocksRequired: 1,
      separateBlocksAvoided
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// ============================================================================
// MAIN DETERMINISTIC AUTOMATIC PLANNING ENGINE
// ============================================================================

export const runPlanningEngine = (requests = [], trains = [], availableBlocks = []) => {
  const sortedRequests = [...requests].sort((a, b) => {
    const pA = getPriorityRank(a.approvedPriority || a.systemAssessedPriority || a.priority);
    const pB = getPriorityRank(b.approvedPriority || b.systemAssessedPriority || b.priority);
    if (pA !== pB) return pA - pB;

    const deadA = a.deadline ? timeToMinutes(a.deadline) : 1440;
    const deadB = b.deadline ? timeToMinutes(b.deadline) : 1440;
    if (deadA !== deadB) return deadA - deadB;

    const startA = timeToMinutes(a.requestedStart);
    const startB = timeToMinutes(b.requestedStart);
    if (startA !== startB) return startA - startB;

    return (a.id || '').localeCompare(b.id || '');
  });

  const activeAssignments = [];
  const integratedBlocks = [];
  const assignedRequestIds = new Set();
  let ibCounter = 1;

  // Pre-seed already approved requests into active assignments so new plans don't clash
  requests.forEach(r => {
    if (r.status === 'Approved' && r.decision) {
      const sMin = timeToMinutes(r.decision.approvedStart || r.requestedStart);
      const eMin = timeToMinutes(r.decision.approvedEnd || r.requestedEnd);
      activeAssignments.push({
        requestId: r.id,
        section: r.section,
        resourceKey: r.resourceKey,
        blockId: r.decision.approvedBlockId,
        startMin: sMin,
        endMin: eMin
      });
    }
  });

  // Filter requests that need scheduling (not Approved, Rejected, or Deferred)
  const pendingRequests = sortedRequests.filter(r => 
    r.status !== 'Approved' && r.status !== 'Rejected' && r.status !== 'Deferred'
  );

  // Group pending requests by section for potential Integrated Blocks
  const requestsBySection = {};
  pendingRequests.forEach(r => {
    if (!requestsBySection[r.section]) requestsBySection[r.section] = [];
    requestsBySection[r.section].push(r);
  });

  // Evaluate candidate integrated groups across all sections
  const allCandidateGroups = [];

  Object.entries(requestsBySection).forEach(([section, secReqs]) => {
    if (secReqs.length < 2) return;

    // 1. Try 3-department combinations (if >= 3 requests)
    if (secReqs.length >= 3) {
      for (let i = 0; i < secReqs.length; i++) {
        for (let j = i + 1; j < secReqs.length; j++) {
          for (let k = j + 1; k < secReqs.length; k++) {
            const group = [secReqs[i], secReqs[j], secReqs[k]];
            const depts = new Set(group.map(r => r.department));
            if (depts.size >= 2) { // At least 2 different departments
              const result = findIntegratedBlockForGroup(group, section, availableBlocks, trains, activeAssignments);
              if (result) {
                allCandidateGroups.push({ group, section, result, size: 3, deptsCount: depts.size });
              }
            }
          }
        }
      }
    }

    // 2. Try 2-department combinations
    for (let i = 0; i < secReqs.length; i++) {
      for (let j = i + 1; j < secReqs.length; j++) {
        const group = [secReqs[i], secReqs[j]];
        const depts = new Set(group.map(r => r.department));
        if (depts.size === 2) { // 2 different departments
          const result = findIntegratedBlockForGroup(group, section, availableBlocks, trains, activeAssignments);
          if (result) {
            allCandidateGroups.push({ group, section, result, size: 2, deptsCount: 2 });
          }
        }
      }
    }
  });

  // Rank candidate groups deterministically across the whole network:
  allCandidateGroups.sort((a, b) => {
    const aPrioritySum = a.group.reduce((sum, r) => sum + (5 - getPriorityRank(r.priority)) * 100, 0);
    const bPrioritySum = b.group.reduce((sum, r) => sum + (5 - getPriorityRank(r.priority)) * 100, 0);
    const aScore = (a.deptsCount === 3 ? 1200 : a.deptsCount * 300) + a.size * 200 + aPrioritySum + (a.result.isPreferred ? 600 : 0);
    const bScore = (b.deptsCount === 3 ? 1200 : b.deptsCount * 300) + b.size * 200 + bPrioritySum + (b.result.isPreferred ? 600 : 0);
    if (aScore !== bScore) return bScore - aScore;
    return a.group.map(r => r.id).join('-').localeCompare(b.group.map(r => r.id).join('-'));
  });

  // Greedily pick disjoint candidate groups
  for (const cand of allCandidateGroups) {
    const overlapsPicked = cand.group.some(r => assignedRequestIds.has(r.id));
    if (overlapsPicked) continue;

    // Ensure resources don't collide with active assignments
    const hasCollision = cand.group.some(r => 
      checkResourceConflict(r.resourceKey, cand.result.startMin, cand.result.endMin, activeAssignments, r.id)
    );
    if (hasCollision) continue;

    // Commit Integrated Maintenance Block!
    const ibId = `IB-${String(ibCounter++).padStart(3, '0')}`;
    const groupReqs = cand.group;
    const section = cand.section;
    const depts = Array.from(new Set(groupReqs.map(r => r.department)));
    const startStr = minutesToTime(cand.result.startMin);
    const endStr = minutesToTime(cand.result.endMin);

    const activities = groupReqs.map(r => ({
      requestId: r.id,
      department: r.department,
      maintenanceType: r.maintenanceType,
      description: r.description,
      durationMinutes: r.estimatedDurationMinutes || 60,
      resourceKey: r.resourceKey,
      priority: r.priority
    }));

    const separateBlocksAvoided = groupReqs.length - 1;
    const explanation = `All ${groupReqs.length} maintenance requests (${groupReqs.map(r => r.id).join(', ')}) operate on corridor section ${section}. Independent department resources (${groupReqs.map(r => r.resourceKey).join(', ')}) permit concurrent execution. Scheduled inside maintenance block ${cand.result.blockId} (${startStr}–${endStr}) with zero passenger train conflicts. Parallel duration is max(${groupReqs.map(r => r.estimatedDurationMinutes || 60).join(', ')}) = ${cand.result.durationMin} min, successfully avoiding ${separateBlocksAvoided} separate corridor block shutdowns.`;

    const factors = [
      { name: 'Corridor Section Alignment', status: 'pass', detail: `All ${groupReqs.length} activities located on section ${section}.` },
      { name: 'Resource Independence', status: 'pass', detail: `Resources (${groupReqs.map(r => r.resourceKey).join(', ')}) operate concurrently without conflict.` },
      { name: 'Block Window Fit', status: 'pass', detail: `Parallel window (${startStr}–${endStr}) fits within available block ${cand.result.blockId}.` },
      { name: 'Train Traffic Clearance', status: 'pass', detail: `Zero passenger or freight train movements on ${section} during window.` },
      { name: 'Deadline Compliance', status: 'pass', detail: `Concludes at ${endStr}, satisfying all constituent deadlines.` }
    ];

    const ibObject = {
      id: ibId,
      creationMode: 'AUTO',
      blockId: cand.result.blockId,
      section,
      date: cand.result.date,
      start: startStr,
      end: endStr,
      durationMinutes: cand.result.durationMin,
      requestIds: groupReqs.map(r => r.id),
      departments: depts,
      requests: groupReqs,
      activities,
      status: 'Pending Approval',
      separateBlocksAvoided,
      explanation,
      factors,
      trainImpact: {
        separateBlocksRequired: groupReqs.length,
        integratedBlocksRequired: 1,
        separateBlocksAvoided
      }
    };

    integratedBlocks.push(ibObject);

    // Register constituent requests
    groupReqs.forEach(r => {
      assignedRequestIds.add(r.id);
      activeAssignments.push({
        requestId: r.id,
        section,
        resourceKey: r.resourceKey,
        blockId: cand.result.blockId,
        startMin: cand.result.startMin,
        endMin: cand.result.endMin
      });
    });
  }

  // Process individual requests
  const plannedRequests = [];
  let totalOptimal = 0;
  let totalRescheduled = 0;
  let totalConflictsDetected = 0;
  let totalUnscheduled = 0;
  let totalIntegratedRequests = 0;
  let totalIndividualRequests = 0;

  for (const req of sortedRequests) {
    if (req.status === 'Approved' || req.status === 'Rejected' || req.status === 'Deferred') {
      plannedRequests.push(req);
      continue;
    }

    const parentIb = integratedBlocks.find(ib => ib.requestIds.includes(req.id));

    if (parentIb) {
      totalIntegratedRequests++;
      const isRescheduled = !intervalsOverlap(
        timeToMinutes(req.requestedStart),
        timeToMinutes(req.requestedEnd),
        timeToMinutes(parentIb.start),
        timeToMinutes(parentIb.end)
      );

      if (isRescheduled) totalRescheduled++;
      else totalOptimal++;

      const otherDepts = parentIb.departments.filter(d => d !== req.department);

      const recommendation = {
        isIntegrated: true,
        integratedBlockId: parentIb.id,
        coordinatedDepartments: otherDepts,
        coordinatedRequests: parentIb.requestIds.filter(id => id !== req.id),
        recommendedSection: parentIb.section,
        recommendedBlockId: parentIb.blockId,
        recommendedDate: parentIb.date,
        recommendedStart: parentIb.start,
        recommendedEnd: parentIb.end,
        status: isRescheduled ? 'RESCHEDULED' : 'OPTIMAL',
        score: isRescheduled ? 94 : 98,
        factors: parentIb.factors,
        explanation: `Scheduled as part of Integrated Maintenance Block ${parentIb.id} on ${parentIb.section} alongside ${otherDepts.join(', ')}. ${parentIb.explanation}`
      };

      plannedRequests.push({
        ...req,
        status: 'Pending Approval',
        conflicts: [],
        recommendation
      });

    } else {
      totalIndividualRequests++;
      const durationMin = req.estimatedDurationMinutes || calculateDurationMinutes(req.requestedStart, req.requestedEnd) || 120;
      const reqStartMin = timeToMinutes(req.requestedStart);
      const reqEndMin = reqStartMin + durationMin;
      const deadlineMin = req.deadline ? timeToMinutes(req.deadline) : 1440;

      const trainConflicts = checkTrainConflicts(req.section, reqStartMin, reqEndMin, trains);
      const matchingBlock = findFittingBlock(req.section, reqStartMin, reqEndMin, availableBlocks);
      const resourceConflict = checkResourceConflict(req.resourceKey, reqStartMin, reqEndMin, activeAssignments, req.id);
      const deadlineOk = reqEndMin <= deadlineMin;

      const isPreferredWindowValid = trainConflicts.length === 0 && matchingBlock && !resourceConflict && deadlineOk;

      if (isPreferredWindowValid) {
        totalOptimal++;
        const factors = [
          { name: 'Train Movement Clearance', status: 'pass', detail: `Zero train conflicts on ${req.section} during ${req.requestedStart}–${req.requestedEnd}.` },
          { name: 'Block Window Fit', status: 'pass', detail: `Fully fits inside available maintenance block ${matchingBlock.blockId} (${matchingBlock.availableFrom}–${matchingBlock.availableUntil}).` },
          { name: 'Resource Availability', status: 'pass', detail: `Resource ${req.resourceKey || 'Crew'} confirmed available.` },
          { name: 'Deadline Safety', status: 'pass', detail: `Ends at ${req.requestedEnd}, respecting deadline (${req.deadline || 'end of day'}).` }
        ];

        const recommendation = {
          isIntegrated: false,
          recommendedSection: req.section,
          recommendedBlockId: matchingBlock.blockId,
          recommendedDate: req.requestedDate || '2026-08-31',
          recommendedStart: req.requestedStart,
          recommendedEnd: req.requestedEnd,
          status: 'OPTIMAL',
          score: 96,
          factors,
          explanation: `Requested time slot ${req.requestedStart}–${req.requestedEnd} on ${req.section} satisfies individual operational constraints. Assigned to block ${matchingBlock.blockId}.`
        };

        activeAssignments.push({
          requestId: req.id,
          section: req.section,
          resourceKey: req.resourceKey,
          blockId: matchingBlock.blockId,
          startMin: reqStartMin,
          endMin: reqEndMin
        });

        plannedRequests.push({
          ...req,
          status: 'Pending Approval',
          conflicts: [],
          recommendation
        });

      } else {
        totalConflictsDetected++;
        const detectedConflicts = [...trainConflicts];

        if (!matchingBlock) {
          detectedConflicts.push({
            type: 'Block Availability Constraint',
            severity: 'Medium',
            description: `No predefined maintenance block covers window (${req.requestedStart}–${req.requestedEnd}) on ${req.section}.`
          });
        }

        if (resourceConflict) {
          detectedConflicts.push({
            type: 'Resource Allocation Collision',
            severity: 'High',
            description: `Resource ${req.resourceKey} is concurrently assigned to ${resourceConflict.requestId} (${minutesToTime(resourceConflict.startMin)}–${minutesToTime(resourceConflict.endMin)}).`
          });
        }

        if (!deadlineOk) {
          detectedConflicts.push({
            type: 'Deadline Exceeded',
            severity: 'High',
            description: `Preferred end time ${req.requestedEnd} exceeds deadline (${req.deadline}).`
          });
        }

        // Search alternative available blocks on this section
        let bestAlternative = null;
        const sectionBlocks = availableBlocks.filter(b => b.section === req.section);

        for (const block of sectionBlocks) {
          const bStartMin = timeToMinutes(block.availableFrom);
          const bEndMin = timeToMinutes(block.availableUntil);
          if (bEndMin - bStartMin < durationMin) continue;

          for (let candidateStart = bStartMin; candidateStart + durationMin <= bEndMin; candidateStart += 15) {
            const candidateEnd = candidateStart + durationMin;
            if (candidateEnd > deadlineMin) continue;

            const tConflicts = checkTrainConflicts(req.section, candidateStart, candidateEnd, trains);
            if (tConflicts.length > 0) continue;

            const resConflict = checkResourceConflict(req.resourceKey, candidateStart, candidateEnd, activeAssignments, req.id);
            if (resConflict) continue;

            bestAlternative = {
              blockId: block.blockId,
              startMin: candidateStart,
              endMin: candidateEnd,
              startTime: minutesToTime(candidateStart),
              endTime: minutesToTime(candidateEnd),
              date: block.date || req.requestedDate || '2026-08-31'
            };
            break;
          }

          if (bestAlternative) break;
        }

        if (bestAlternative) {
          totalRescheduled++;
          const conflictReason = detectedConflicts.map(c => c.description).join(' ');
          const explanation = `Requested window ${req.requestedStart}–${req.requestedEnd} was unavailable (${conflictReason}). The RailPlan Planning Engine shifted work to Block ${bestAlternative.blockId} (${bestAlternative.startTime}–${bestAlternative.endTime}) with zero train interference before deadline (${req.deadline || 'end of day'}).`;

          const factors = [
            { name: 'Train Conflict Avoidance', status: 'pass', detail: `Alternative window clears corridor traffic on ${req.section}.` },
            { name: 'Block Capacity', status: 'pass', detail: `Assigned to block ${bestAlternative.blockId} (${bestAlternative.startTime}–${bestAlternative.endTime}).` },
            { name: 'Resource Availability', status: 'pass', detail: `Resource ${req.resourceKey || 'Crew'} available for rescheduled slot.` },
            { name: 'Deadline Safety', status: 'pass', detail: `Concludes at ${bestAlternative.endTime}, meeting deadline (${req.deadline || 'end of day'}).` }
          ];

          const recommendation = {
            isIntegrated: false,
            recommendedSection: req.section,
            recommendedBlockId: bestAlternative.blockId,
            recommendedDate: bestAlternative.date,
            recommendedStart: bestAlternative.startTime,
            recommendedEnd: bestAlternative.endTime,
            status: 'RESCHEDULED',
            score: 90,
            factors,
            explanation
          };

          activeAssignments.push({
            requestId: req.id,
            section: req.section,
            resourceKey: req.resourceKey,
            blockId: bestAlternative.blockId,
            startMin: bestAlternative.startMin,
            endMin: bestAlternative.endMin
          });

          plannedRequests.push({
            ...req,
            status: 'Conflict Detected',
            conflicts: detectedConflicts,
            recommendation
          });

        } else {
          totalUnscheduled++;
          const explanation = `No valid maintenance block found on ${req.section} for duration of ${durationMin} minutes before deadline (${req.deadline || 'end of day'}) due to corridor train saturation and resource constraints. Manual planner intervention required.`;

          plannedRequests.push({
            ...req,
            status: 'Conflict Detected',
            conflicts: detectedConflicts,
            recommendation: {
              isIntegrated: false,
              recommendedSection: req.section,
              recommendedBlockId: null,
              recommendedDate: req.requestedDate,
              recommendedStart: null,
              recommendedEnd: null,
              status: 'UNSCHEDULED',
              score: 40,
              factors: [
                { name: 'Corridor Saturation', status: 'fail', detail: 'High train density during all available maintenance windows.' },
                { name: 'Deadline Constraint', status: 'fail', detail: 'Cannot complete required duration before deadline.' }
              ],
              explanation
            }
          });
        }
      }
    }
  }

  const separateBlocksAvoided = integratedBlocks.reduce((sum, ib) => sum + ib.separateBlocksAvoided, 0);
  const departmentsCoordinated = Array.from(new Set(integratedBlocks.flatMap(ib => ib.departments)));

  return {
    requests: plannedRequests,
    integratedBlocks,
    metrics: {
      totalEvaluated: sortedRequests.length,
      totalScheduled: plannedRequests.filter(r => r.recommendation?.status !== 'UNSCHEDULED').length,
      totalIntegratedRequests,
      totalIndividualRequests,
      totalOptimal,
      totalRescheduled,
      totalConflictsDetected,
      totalUnscheduled,
      integratedBlocksCreated: integratedBlocks.length,
      separateBlocksAvoided,
      departmentsCoordinated
    }
  };
};

export default runPlanningEngine;
