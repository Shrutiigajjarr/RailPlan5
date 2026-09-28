// Priority Validation & Reassessment Engine for RailPlan4
// Evaluates requested priority against asset availability, asset criticality,
// overdue maintenance, maintenance urgency, and operational impact.
// Maintains three distinct values: Requested Priority, System-Assessed Priority, and Approved Priority.

export const PRIORITY_LEVELS = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

export const VALIDATION_STATUS = {
  MATCHED: 'MATCHED',
  OVERSTATED: 'OVERSTATED',
  UNDERSTATED: 'UNDERSTATED'
};

const PRIORITY_RANK = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4
};

/**
 * Evaluates priority for a maintenance request.
 * @param {Object} request - Maintenance request object
 * @returns {Object} Priority validation result with requested, system-assessed, and approved priorities
 */
export const evaluatePriorityValidation = (request) => {
  if (!request) {
    return {
      requestedPriority: 'MEDIUM',
      systemAssessedPriority: 'MEDIUM',
      approvedPriority: 'MEDIUM',
      validationStatus: VALIDATION_STATUS.MATCHED,
      explanation: 'Standard system priority assessment applied.',
      isFlagged: false,
      evidence: {
        assetCriticality: 'MEDIUM',
        overdueDays: 5,
        maintenanceUrgency: 'PREVENTIVE',
        operationalImpact: 'HIGH_TRAFFIC_CORRIDOR',
        assetAvailability: 'PARTIAL_REDUNDANCY'
      }
    };
  }

  const requestedPriority = (request.requestedPriority || request.priority || 'MEDIUM').toUpperCase();
  const rawEvidence = request.priorityEvidence || request.assetData || {};

  // Infer any missing evidence parameters directly from request properties
  let criticality = (rawEvidence.assetCriticality || '').toUpperCase();
  let overdueDays = rawEvidence.overdueDays !== undefined && rawEvidence.overdueDays !== null
    ? Number(rawEvidence.overdueDays)
    : null;
  let urgency = (rawEvidence.maintenanceUrgency || '').toUpperCase();
  let impact = (rawEvidence.operationalImpact || '').toUpperCase();
  let redundancy = (rawEvidence.assetAvailability || '').toUpperCase();

  const desc = (request.description || '').toLowerCase();
  const type = (request.maintenanceType || '').toLowerCase();

  if (!criticality) {
    if (requestedPriority === 'CRITICAL' || type.includes('bridge') || desc.includes('safety mandate')) {
      criticality = 'CRITICAL';
    } else if (requestedPriority === 'HIGH' || type.includes('renewal') || type.includes('signal')) {
      criticality = 'HIGH';
    } else if (requestedPriority === 'LOW') {
      criticality = 'LOW';
    } else {
      criticality = 'MEDIUM';
    }
  }

  if (overdueDays === null) {
    if (urgency === 'SAFETY_MANDATE' || requestedPriority === 'CRITICAL') overdueDays = 30;
    else if (urgency === 'PRE_MONSOON_SAFETY' || requestedPriority === 'HIGH') overdueDays = 15;
    else if (requestedPriority === 'LOW') overdueDays = 0;
    else overdueDays = 5;
  }

  if (!urgency) {
    if (desc.includes('safety mandate') || requestedPriority === 'CRITICAL') urgency = 'SAFETY_MANDATE';
    else if (desc.includes('pre-monsoon')) urgency = 'PRE_MONSOON_SAFETY';
    else if (requestedPriority === 'HIGH') urgency = 'PREVENTIVE';
    else if (requestedPriority === 'LOW') urgency = 'ROUTINE';
    else urgency = 'PREVENTIVE';
  }

  if (!impact) {
    if (request.blockOrTrack === 'Both Lines' || (request.section || '').includes('SEC-01') || (request.section || '').includes('SEC-02')) {
      impact = 'MAIN_LINE_SHUTDOWN';
    } else {
      impact = 'HIGH_TRAFFIC_CORRIDOR';
    }
  }

  if (!redundancy) {
    if (request.blockOrTrack === 'Both Lines') redundancy = 'NO_REDUNDANCY';
    else redundancy = 'PARTIAL_REDUNDANCY';
  }

  // Calculate System-Assessed Priority
  let systemAssessedPriority = (request.systemAssessedPriority || '').toUpperCase();

  if (!systemAssessedPriority || !PRIORITY_RANK[systemAssessedPriority]) {
    if (
      urgency === 'SAFETY_MANDATE' ||
      overdueDays >= 30 ||
      (criticality === 'CRITICAL' && impact === 'MAIN_LINE_SHUTDOWN')
    ) {
      systemAssessedPriority = PRIORITY_LEVELS.CRITICAL;
    } else if (
      overdueDays >= 10 ||
      criticality === 'HIGH' ||
      urgency === 'PRE_MONSOON_SAFETY' ||
      (impact === 'HIGH_TRAFFIC_CORRIDOR' && redundancy !== 'FULL_REDUNDANCY')
    ) {
      systemAssessedPriority = PRIORITY_LEVELS.HIGH;
    } else if (
      overdueDays < 10 && overdueDays > 0 &&
      (criticality === 'MEDIUM' || urgency === 'PREVENTIVE')
    ) {
      systemAssessedPriority = PRIORITY_LEVELS.MEDIUM;
    } else if (
      overdueDays === 0 ||
      urgency === 'ROUTINE' ||
      redundancy === 'FULL_REDUNDANCY'
    ) {
      systemAssessedPriority = PRIORITY_LEVELS.LOW;
    } else {
      systemAssessedPriority = PRIORITY_LEVELS.MEDIUM;
    }
  }

  // Compare Requested vs System-Assessed
  const reqRank = PRIORITY_RANK[requestedPriority] || 3;
  const sysRank = PRIORITY_RANK[systemAssessedPriority] || 3;

  let validationStatus = VALIDATION_STATUS.MATCHED;
  let explanation = '';
  let isFlagged = false;

  if (reqRank === sysRank) {
    validationStatus = VALIDATION_STATUS.MATCHED;
    explanation = `Submitted priority (${requestedPriority}) matches system evaluation based on asset criticality (${criticality}), overdue maintenance (${overdueDays}d), urgency (${urgency}), and operational impact (${impact}).`;
    isFlagged = false;
  } else if (reqRank < sysRank) { // e.g. Submitted CRITICAL (1), System HIGH (2)
    validationStatus = VALIDATION_STATUS.OVERSTATED;
    explanation = `Submitted priority (${requestedPriority}) appears HIGHER than evidence supports (System-Assessed: ${systemAssessedPriority}). Asset has ${redundancy} and overdue maintenance is ${overdueDays} days. Flagged for priority reassessment.`;
    isFlagged = true;
  } else { // e.g. Submitted LOW (4), System HIGH (2)
    validationStatus = VALIDATION_STATUS.UNDERSTATED;
    explanation = `Submitted priority (${requestedPriority}) appears LOWER than evidence supports (System-Assessed: ${systemAssessedPriority}). Asset is overdue by ${overdueDays} days on ${impact}. Priority should be upgraded.`;
    isFlagged = true;
  }

  // Approved priority defaults to COA explicitly set approvedPriority, or systemAssessedPriority
  const approvedPriority = (request.approvedPriority || systemAssessedPriority || requestedPriority).toUpperCase();

  return {
    requestedPriority,
    systemAssessedPriority,
    approvedPriority,
    validationStatus,
    explanation,
    isFlagged,
    evidence: {
      assetCriticality: criticality,
      overdueDays,
      maintenanceUrgency: urgency,
      operationalImpact: impact,
      assetAvailability: redundancy
    }
  };
};

export default evaluatePriorityValidation;
