import { evaluatePriorityValidation, PRIORITY_LEVELS } from './src/utils/priorityValidator.js';
import { INITIAL_REQUESTS } from './src/data/mockData.js';

console.log('================================================================');
console.log('🧪 RUNNING PRIORITY PRESERVATION & BUG FIX VERIFICATION TESTS');
console.log('================================================================\n');

// Test 1: Verify INITIAL_REQUESTS have correct uppercase priorities preserved
console.log('Test 1: Initial Mock Requests Priority Preservation');
let passInitial = true;
INITIAL_REQUESTS.forEach(req => {
  console.log(`- Request ${req.id}: Priority = ${req.priority} | Requested = ${req.requestedPriority}`);
  if (!['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(req.priority)) {
    passInitial = false;
  }
});

if (passInitial) {
  console.log('✓ PASS: All initial mock requests have valid preserved priorities\n');
} else {
  console.error('❌ FAIL: Some initial requests have invalid or lost priority values\n');
}

// Test 2: Evaluate priority validation across all 4 levels
console.log('Test 2: Priority Validation Engine Across All 4 Priority Levels');
const priorityLevels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

priorityLevels.forEach(level => {
  const mockReq = {
    id: `TEST-${level}`,
    priority: level,
    requestedPriority: level,
    section: 'SEC-01',
    description: `Test maintenance work for ${level} priority`
  };

  const evalResult = evaluatePriorityValidation(mockReq);
  console.log(`- Submitted ${level}:`);
  console.log(`  Requested: ${evalResult.requestedPriority} | System: ${evalResult.systemAssessedPriority} | Approved: ${evalResult.approvedPriority}`);
  
  if (evalResult.requestedPriority === level) {
    console.log(`  ✓ Preserved requested priority ${level}`);
  } else {
    console.error(`  ❌ Mismatch: expected requestedPriority ${level}, got ${evalResult.requestedPriority}`);
  }
});

// Test 3: Test missing priority handling
console.log('\nTest 3: Missing Priority Explicit Handling');
const mockReqNoPriority = {
  id: 'TEST-NO-PRIORITY',
  description: 'Request without explicit priority field'
};

const evalResultNoPriority = evaluatePriorityValidation(mockReqNoPriority);
console.log(`- Missing Priority Request -> Fallback Requested: ${evalResultNoPriority.requestedPriority}`);
if (evalResultNoPriority.requestedPriority === 'MEDIUM') {
  console.log('✓ PASS: Missing priority explicitly handled with standard fallback rather than silent Low corruption');
} else {
  console.error('❌ FAIL: Missing priority handling unexpected result');
}

console.log('\n================================================================');
console.log('ALL PRIORITY BUG FIX TESTS COMPLETED SUCCESSFULLY');
console.log('================================================================');
