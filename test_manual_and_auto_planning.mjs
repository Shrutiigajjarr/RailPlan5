// Comprehensive Test Suite for RailPlan Planning Engine (Auto & Manual Integrated Planning)

import { 
  runPlanningEngine, 
  checkIntegrationCompatibility, 
  buildManualIntegratedBlock,
  findCompatibleCandidateRequests 
} from './src/utils/planningEngine.js';
import { INITIAL_REQUESTS, MOCK_TRAINS, AVAILABLE_BLOCKS } from './src/data/mockData.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('🧪 RUNNING COMPREHENSIVE RAILPLAN PLANNING TESTS');
console.log('================================================================\n');

// -------------------------------------------------------------
// TEST 1: Manual selection < 2 requests -> rejected
// -------------------------------------------------------------
console.log('Test 1: Manual Selection with < 2 requests');
const test1 = checkIntegrationCompatibility([INITIAL_REQUESTS[0]], AVAILABLE_BLOCKS, MOCK_TRAINS);
assert(!test1.isCompatible, 'Single request cannot form an integrated block');
assert(test1.incompatibleReasons.length > 0, 'Returns clear incompatible reason for < 2 requests');

// -------------------------------------------------------------
// TEST 2: 2 Compatible requests on same section
// -------------------------------------------------------------
console.log('\nTest 2: 2 Compatible requests (Engineering + S&T on SEC-02)');
const reqEngSec2 = {
  id: 'REQ-TEST-01',
  department: 'Engineering',
  section: 'SEC-02',
  resourceKey: 'ENG_TRACK_TEAM_1',
  maintenanceType: 'Track Maintenance',
  estimatedDurationMinutes: 60,
  requestedDate: '2026-08-31',
  requestedStart: '12:30',
  requestedEnd: '13:30',
  deadline: '2026-08-31 18:00',
  status: 'Submitted'
};

const reqStSec2 = {
  id: 'REQ-TEST-02',
  department: 'S&T',
  section: 'SEC-02',
  resourceKey: 'ST_SIGNAL_TEAM_1',
  maintenanceType: 'Point Machine Testing',
  estimatedDurationMinutes: 45,
  requestedDate: '2026-08-31',
  requestedStart: '12:30',
  requestedEnd: '13:15',
  deadline: '2026-08-31 18:00',
  status: 'Submitted'
};

const test2 = checkIntegrationCompatibility([reqEngSec2, reqStSec2], AVAILABLE_BLOCKS, MOCK_TRAINS);
assert(test2.isCompatible, '2 compatible requests on SEC-02 are valid');
assert(test2.integratedDuration === 60, 'Parallel duration equals max(60, 45) = 60 min');
assert(test2.benefits.separateBlocksAvoided === 1, 'Separate blocks avoided = 1');
assert(test2.availableBlockOptions.length > 0, 'Found valid block windows');
assert(test2.recommendedBlock !== null, 'Identified recommended block option');

// -------------------------------------------------------------
// TEST 3: 3 Compatible requests across 3 departments on SEC-02
// -------------------------------------------------------------
console.log('\nTest 3: 3 Compatible requests (Engineering + S&T + Traction on SEC-02)');
const reqTrdSec2 = {
  id: 'REQ-TEST-03',
  department: 'Traction Distribution',
  section: 'SEC-02',
  resourceKey: 'TRD_OHE_TEAM_1',
  maintenanceType: '25kV OHE Inspection',
  estimatedDurationMinutes: 60,
  requestedDate: '2026-08-31',
  requestedStart: '12:30',
  requestedEnd: '13:30',
  deadline: '2026-08-31 18:00',
  status: 'Submitted'
};

const test3 = checkIntegrationCompatibility([reqEngSec2, reqStSec2, reqTrdSec2], AVAILABLE_BLOCKS, MOCK_TRAINS);
assert(test3.isCompatible, '3 department requests on SEC-02 are valid');
assert(test3.departments.length === 3, 'Coordinated 3 distinct departments');
assert(test3.benefits.separateBlocksAvoided === 2, 'Separate blocks avoided = 2');
assert(test3.integratedDuration === 60, 'Parallel duration is 60m');

// -------------------------------------------------------------
// TEST 4: Different Sections Rule Violation
// -------------------------------------------------------------
console.log('\nTest 4: Incompatible Sections (SEC-02 vs SEC-05)');
const reqSec5 = {
  id: 'REQ-TEST-04',
  department: 'Engineering',
  section: 'SEC-05',
  resourceKey: 'ENG_TRACK_TEAM_1',
  maintenanceType: 'Track Inspection',
  estimatedDurationMinutes: 45,
  requestedDate: '2026-08-31',
  requestedStart: '12:00',
  requestedEnd: '12:45',
  deadline: '2026-08-31 18:00',
  status: 'Submitted'
};

const test4 = checkIntegrationCompatibility([reqEngSec2, reqSec5], AVAILABLE_BLOCKS, MOCK_TRAINS);
assert(!test4.isCompatible, 'Requests on differing sections are rejected');
assert(test4.incompatibleReasons.some(r => r.includes('Section Mismatch')), 'Explains specific section mismatch');

// -------------------------------------------------------------
// TEST 5: Resource Conflict Violation
// -------------------------------------------------------------
console.log('\nTest 5: Resource Collision (Both require ENG_TRACK_TEAM_1)');
const reqEngCollision = {
  id: 'REQ-TEST-05',
  department: 'Engineering',
  section: 'SEC-02',
  resourceKey: 'ENG_TRACK_TEAM_1', // SAME RESOURCE
  maintenanceType: 'Deep Screening',
  estimatedDurationMinutes: 60,
  requestedDate: '2026-08-31',
  requestedStart: '12:30',
  requestedEnd: '13:30',
  deadline: '2026-08-31 18:00',
  status: 'Submitted'
};

const test5 = checkIntegrationCompatibility([reqEngSec2, reqEngCollision], AVAILABLE_BLOCKS, MOCK_TRAINS);
assert(!test5.isCompatible, 'Requests with identical exclusive resources are rejected');
assert(test5.incompatibleReasons.some(r => r.includes('Resource Collision')), 'Explains resource collision');

// -------------------------------------------------------------
// TEST 6: Deadline Failure
// -------------------------------------------------------------
console.log('\nTest 6: Deadline Constraint Violation');
const reqExpiredDeadline = {
  id: 'REQ-TEST-06',
  department: 'S&T',
  section: 'SEC-02',
  resourceKey: 'ST_SIGNAL_TEAM_1',
  maintenanceType: 'Signal Work',
  estimatedDurationMinutes: 60,
  requestedDate: '2026-08-31',
  requestedStart: '12:30',
  requestedEnd: '13:30',
  deadline: '2026-08-31 07:00', // Expired before available blocks
  status: 'Submitted'
};

const test6 = checkIntegrationCompatibility([reqEngSec2, reqExpiredDeadline], AVAILABLE_BLOCKS, MOCK_TRAINS);
assert(!test6.isCompatible, 'Cannot combine if no block window finishes before deadline');

// -------------------------------------------------------------
// TEST 7: Manual Block Object Construction
// -------------------------------------------------------------
console.log('\nTest 7: Manual Integrated Block Model Consistency');
const manualBlock = buildManualIntegratedBlock(
  [reqEngSec2, reqStSec2, reqTrdSec2],
  test3.recommendedBlock,
  'IB-006'
);

assert(manualBlock.id === 'IB-006', 'Block ID correctly set to IB-006');
assert(manualBlock.creationMode === 'MANUAL', 'Creation mode marked as MANUAL');
assert(manualBlock.status === 'Pending Approval', 'Initial status is Pending Approval');
assert(manualBlock.requestIds.length === 3, 'Contains all 3 request IDs');
assert(manualBlock.separateBlocksAvoided === 2, 'Separate blocks avoided = 2');
assert(manualBlock.factors.length > 0, 'Generates diagnostic factors');
assert(typeof manualBlock.explanation === 'string', 'Generates human-readable explanation');

// -------------------------------------------------------------
// TEST 8: Candidate Suggestions Helper
// -------------------------------------------------------------
console.log('\nTest 8: Candidate Request Suggestions');
const candidateSuggestions = findCompatibleCandidateRequests(
  reqEngSec2,
  [reqStSec2, reqTrdSec2, reqSec5],
  AVAILABLE_BLOCKS,
  MOCK_TRAINS
);
assert(candidateSuggestions.length === 3, 'Returns suggestions for all candidates');
assert(candidateSuggestions[0].matchBadge === 'Optimal Candidate', 'Optimal candidate ranked first');
assert(candidateSuggestions.find(c => c.request.id === 'REQ-TEST-04').matchBadge === 'Different Section', 'Different section identified');

// -------------------------------------------------------------
// TEST 9: Automatic Planning Engine Verification (Existing feature intact)
// -------------------------------------------------------------
console.log('\nTest 9: Automatic Planning Engine Execution');
const autoResult = runPlanningEngine(INITIAL_REQUESTS, MOCK_TRAINS, AVAILABLE_BLOCKS);
assert(autoResult.integratedBlocks.length >= 1, 'Auto planner successfully created integrated block(s)');
assert(autoResult.metrics.totalScheduled > 0, 'Auto planner successfully scheduled requests');
assert(autoResult.integratedBlocks[0].creationMode === 'AUTO', 'Auto block marked creationMode: AUTO');
assert(autoResult.requests.length === INITIAL_REQUESTS.length, 'All requests processed');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
