// Train Impact Analysis Engine for RailPlan4
// Identifies scheduled trains overlapping proposed maintenance block windows,
// detects conflicts, estimates delays, calculates automatic rescheduling recommendations,
// and evaluates alternative block windows using the planning engine.

import { timeToMinutes, minutesToTime, intervalsOverlap } from './planningEngine.js';

/**
 * Analyzes train impact for a proposed maintenance block window on a railway section.
 * Calculates automatic rescheduling recommendations for all affected trains.
 * 
 * @param {Object} proposedBlock - Block info containing { section, start, end, date, blockId }
 * @param {Array} trains - Scheduled train movements (MOCK_TRAINS)
 * @param {Array} availableBlocks - Available section maintenance blocks (AVAILABLE_BLOCKS)
 * @returns {Object} Comprehensive train impact analysis report with rescheduling recommendations
 */
export const analyzeTrainImpact = (proposedBlock = {}, trains = [], availableBlocks = []) => {
  if (!proposedBlock.section || !proposedBlock.start || !proposedBlock.end) {
    return {
      section: proposedBlock.section || null,
      blockWindow: proposedBlock.start && proposedBlock.end ? `${proposedBlock.start}–${proposedBlock.end}` : 'N/A',
      totalTrainsOnSection: 0,
      affectedTrainsCount: 0,
      affectedTrains: [],
      reschedulingRecommendations: [],
      totalEstimatedDelayMinutes: 0,
      delaysWithMissingDataCount: 0,
      alternativeBlockWindows: [],
      hasConflicts: false,
      summaryMessage: 'No valid block window provided for train impact analysis.'
    };
  }

  const section = proposedBlock.section;
  const blockStartMin = timeToMinutes(proposedBlock.start);
  const blockEndMin = timeToMinutes(proposedBlock.end);
  const blockDurationMin = blockEndMin - blockStartMin;

  // 1. Identify trains scheduled on the same section
  const sectionTrains = trains.filter(t => t.section === section);

  const affectedTrains = [];
  let totalEstimatedDelayMinutes = 0;
  let delaysWithMissingDataCount = 0;

  sectionTrains.forEach(train => {
    const trainStartMin = timeToMinutes(train.start);
    const trainEndMin = timeToMinutes(train.end);

    // 2. Check overlap between train scheduled movement and proposed block window
    const overlaps = intervalsOverlap(blockStartMin, blockEndMin, trainStartMin, trainEndMin);

    if (overlaps) {
      // Detected Conflict (Spatial / Temporal Overlap)
      const detectedConflict = {
        hasConflict: true,
        conflictType: 'Train Movement Overlap',
        severity: (train.priority || '').includes('Rajdhani') || (train.priority || '').includes('Vande') ? 'High' : 'Medium',
        description: `Train #${train.trainNo} (${train.name}) scheduled on ${section} (${train.start}–${train.end}) overlaps proposed block window (${proposedBlock.start}–${proposedBlock.end}).`
      };

      // Estimate delays ONLY when sufficient timetable & operational data are available
      let delayAnalysis = {};

      if (train.timetableAvailable === false || train.hasMissingOperationalData) {
        delaysWithMissingDataCount++;
        delayAnalysis = {
          estimatedDelayMinutes: null,
          delayStatus: 'INSUFFICIENT_TIMETABLE_DATA',
          delayExplanation: `Operational speed profile or station headway data missing for Train #${train.trainNo}. Delay cannot be estimated.`
        };
      } else {
        const estimatedDelayMinutes = Math.max(0, blockEndMin - trainStartMin);
        totalEstimatedDelayMinutes += estimatedDelayMinutes;

        delayAnalysis = {
          estimatedDelayMinutes,
          delayStatus: 'ESTIMATED',
          delayExplanation: `Estimated timetable hold delay of ${estimatedDelayMinutes} mins until section clears at ${proposedBlock.end}.`
        };
      }

      affectedTrains.push({
        trainId: train.trainId,
        trainNo: train.trainNo,
        trainName: train.name,
        priority: train.priority,
        scheduledStart: train.start,
        scheduledEnd: train.end,
        scheduledWindow: `${train.start}–${train.end}`,
        conflictingBlockWindow: `${proposedBlock.start}–${proposedBlock.end}`,
        section,
        detectedConflict,
        delayAnalysis
      });
    }
  });

  // 3. Calculate Automatic Rescheduling Recommendations for affected trains
  // Sort affected trains by priority rank (Express/Rajdhani first) then original start time
  const sortedAffected = [...affectedTrains].sort((a, b) => {
    const pA = (a.priority || '').includes('Rajdhani') || (a.priority || '').includes('Vande') ? 1 : 2;
    const pB = (b.priority || '').includes('Rajdhani') || (b.priority || '').includes('Vande') ? 1 : 2;
    if (pA !== pB) return pA - pB;
    return timeToMinutes(a.scheduledStart) - timeToMinutes(b.scheduledStart);
  });

  // Track reserved time slots on the section after block completion
  // Seed with non-affected scheduled train movements on the section
  const reservedWindows = sectionTrains
    .filter(t => !affectedTrains.some(at => at.trainId === t.trainId))
    .map(t => ({
      startMin: timeToMinutes(t.start),
      endMin: timeToMinutes(t.end),
      label: `Train #${t.trainNo}`
    }));

  const reschedulingRecommendations = [];

  sortedAffected.forEach(trainObj => {
    const origTrain = sectionTrains.find(t => t.trainId === trainObj.trainId);
    const origStartMin = timeToMinutes(trainObj.scheduledStart);
    const origEndMin = timeToMinutes(trainObj.scheduledEnd);
    const durationMin = origEndMin - origStartMin;

    // Check if train lacks timetable/operational data
    if (origTrain?.timetableAvailable === false || origTrain?.hasMissingOperationalData) {
      reschedulingRecommendations.push({
        trainId: trainObj.trainId,
        trainNo: trainObj.trainNo,
        trainName: trainObj.trainName,
        priority: trainObj.priority,
        section,
        originalWindow: trainObj.scheduledWindow,
        suggestedRevisedWindow: 'N/A (Unfeasible)',
        suggestedRevisedStart: null,
        suggestedRevisedEnd: null,
        estimatedDelayMinutes: null,
        isRescheduleFeasible: false,
        reason: 'Unfeasible: Operational speed/timetable profile missing for this service; revised time cannot be calculated.',
        conflictingBlockWindow: `${proposedBlock.start}–${proposedBlock.end}`
      });
      return;
    }

    // Search for earliest feasible slot post block completion (blockEndMin) accounting for overlapping trains
    let candidateStart = blockEndMin;
    let candidateEnd = candidateStart + durationMin;
    let foundSlot = false;
    const headwayMin = 5; // 5-min safety headway buffer between train movements

    while (candidateEnd <= 1440) { // Search up to end of day
      const hasCollision = reservedWindows.some(rw => 
        intervalsOverlap(candidateStart, candidateEnd, rw.startMin - headwayMin, rw.endMin + headwayMin)
      );

      if (!hasCollision) {
        foundSlot = true;
        break;
      }

      candidateStart += 15; // Step in 15-minute steps
      candidateEnd = candidateStart + durationMin;
    }

    if (foundSlot) {
      const revisedStartStr = minutesToTime(candidateStart);
      const revisedEndStr = minutesToTime(candidateEnd);
      const delayMinutes = candidateStart - origStartMin;

      // Reserve this window so subsequent affected trains don't overlap with it!
      reservedWindows.push({
        startMin: candidateStart,
        endMin: candidateEnd,
        label: `Rescheduled Train #${trainObj.trainNo}`
      });

      reschedulingRecommendations.push({
        trainId: trainObj.trainId,
        trainNo: trainObj.trainNo,
        trainName: trainObj.trainName,
        priority: trainObj.priority,
        section,
        originalWindow: trainObj.scheduledWindow,
        suggestedRevisedWindow: `${revisedStartStr}–${revisedEndStr}`,
        suggestedRevisedStart: revisedStartStr,
        suggestedRevisedEnd: revisedEndStr,
        estimatedDelayMinutes: delayMinutes,
        isRescheduleFeasible: true,
        reason: `Shifted post-block completion (${proposedBlock.end}) to ${revisedStartStr}–${revisedEndStr} (${delayMinutes}m delay), clear of surrounding train traffic.`,
        conflictingBlockWindow: `${proposedBlock.start}–${proposedBlock.end}`
      });
    } else {
      reschedulingRecommendations.push({
        trainId: trainObj.trainId,
        trainNo: trainObj.trainNo,
        trainName: trainObj.trainName,
        priority: trainObj.priority,
        section,
        originalWindow: trainObj.scheduledWindow,
        suggestedRevisedWindow: 'N/A (Unfeasible)',
        suggestedRevisedStart: null,
        suggestedRevisedEnd: null,
        estimatedDelayMinutes: null,
        isRescheduleFeasible: false,
        reason: 'Unfeasible: Exceeds section track capacity post-block window without conflicting with downstream train schedules.',
        conflictingBlockWindow: `${proposedBlock.start}–${proposedBlock.end}`
      });
    }
  });

  // 4. Find Alternative Block Windows using available blocks & zero train conflicts
  const sectionBlocks = availableBlocks.filter(b => b.section === section);
  const alternativeBlockWindows = [];

  sectionBlocks.forEach(block => {
    const bStartMin = timeToMinutes(block.availableFrom);
    const bEndMin = timeToMinutes(block.availableUntil);

    if (bEndMin - bStartMin < blockDurationMin) return;

    for (let candStart = bStartMin; candStart + blockDurationMin <= bEndMin; candStart += 15) {
      const candEnd = candStart + blockDurationMin;

      const hasTrainOverlap = sectionTrains.some(t => {
        const tStart = timeToMinutes(t.start);
        const tEnd = timeToMinutes(t.end);
        return intervalsOverlap(candStart, candEnd, tStart, tEnd);
      });

      if (!hasTrainOverlap) {
        const candStartStr = minutesToTime(candStart);
        const candEndStr = minutesToTime(candEnd);

        if (candStartStr === proposedBlock.start && candEndStr === proposedBlock.end) {
          continue;
        }

        alternativeBlockWindows.push({
          blockId: block.blockId,
          blockName: block.name || `Block ${block.blockId}`,
          section,
          date: block.date || proposedBlock.date || '2026-08-31',
          alternativeStart: candStartStr,
          alternativeEnd: candEndStr,
          alternativeWindow: `${candStartStr}–${candEndStr}`,
          durationMinutes: blockDurationMin,
          hasTrainConflict: false,
          impactScore: 'Zero Conflict',
          explanation: `Alternative window (${candStartStr}–${candEndStr}) in Block ${block.blockId} has zero passenger train movement conflicts.`
        });
      }
    }
  });

  // Deduplicate alternative block windows
  const uniqueAlternativesMap = new Map();
  alternativeBlockWindows.forEach(alt => {
    const key = `${alt.blockId}-${alt.alternativeStart}-${alt.alternativeEnd}`;
    if (!uniqueAlternativesMap.has(key)) {
      uniqueAlternativesMap.set(key, alt);
    }
  });

  const finalAlternatives = Array.from(uniqueAlternativesMap.values()).slice(0, 4);
  const hasConflicts = affectedTrains.length > 0;
  const summaryMessage = hasConflicts
    ? `Detected ${affectedTrains.length} conflicting train movement(s) on ${section} during proposed block ${proposedBlock.start}–${proposedBlock.end}. Calculated ${reschedulingRecommendations.filter(r => r.isRescheduleFeasible).length}/${affectedTrains.length} feasible train rescheduling recommendations.`
    : `Proposed block window ${proposedBlock.start}–${proposedBlock.end} on ${section} is completely clear of scheduled train traffic.`;

  return {
    section,
    blockId: proposedBlock.blockId || proposedBlock.recommendedBlockId || 'MB-PROP',
    blockWindow: `${proposedBlock.start}–${proposedBlock.end}`,
    blockDate: proposedBlock.date || '2026-08-31',
    totalTrainsOnSection: sectionTrains.length,
    affectedTrainsCount: affectedTrains.length,
    affectedTrains,
    reschedulingRecommendations,
    totalEstimatedDelayMinutes,
    delaysWithMissingDataCount,
    alternativeBlockWindows: finalAlternatives,
    hasConflicts,
    summaryMessage
  };
};

export default analyzeTrainImpact;
