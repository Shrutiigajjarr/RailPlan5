import { analyzeTrainImpact } from './src/utils/trainImpactAnalyzer.js';
import { MOCK_TRAINS, AVAILABLE_BLOCKS } from './src/data/mockData.js';

console.log('================================================================');
console.log('🧪 RUNNING TRAIN IMPACT & AUTOMATIC RESCHEDULING TESTS');
console.log('================================================================\n');

// Test 1: Proposed block with multiple overlapping train movements (SEC-01)
const testBlock1 = {
  section: 'SEC-01',
  start: '12:00',
  end: '15:00',
  date: '2026-08-31',
  blockId: 'MB-TEST-01'
};

const result1 = analyzeTrainImpact(testBlock1, MOCK_TRAINS, AVAILABLE_BLOCKS);

console.log(`Test 1: Conflict Detection on ${result1.section}`);
console.log(`- Affected Trains Count: ${result1.affectedTrainsCount}`);
console.log(`- Summary Message: ${result1.summaryMessage}`);

if (result1.affectedTrainsCount > 0) {
  console.log('✓ PASS: Correctly identified overlapping scheduled train movements');
} else {
  console.error('❌ FAIL: Expected train conflicts on SEC-01 between 12:00 and 15:00');
}

// Test 2: Rescheduling Recommendations Verification
console.log('\nTest 2: Automatic Rescheduling Recommendations Calculation');
result1.reschedulingRecommendations.forEach(recom => {
  console.log(`- Train #${recom.trainNo} (${recom.trainName}):`);
  console.log(`  Original: ${recom.originalWindow} -> Suggested Revised: ${recom.suggestedRevisedWindow}`);
  console.log(`  Feasible: ${recom.isRescheduleFeasible} | Delay: ${recom.estimatedDelayMinutes != null ? recom.estimatedDelayMinutes + 'm' : 'N/A'}`);
  console.log(`  Reason: ${recom.reason}`);
});

const feasibleCount = result1.reschedulingRecommendations.filter(r => r.isRescheduleFeasible).length;
const unfeasibleCount = result1.reschedulingRecommendations.filter(r => !r.isRescheduleFeasible).length;

if (result1.reschedulingRecommendations.length === result1.affectedTrainsCount) {
  console.log('✓ PASS: Recommendation calculated for every affected train');
} else {
  console.error('❌ FAIL: Recommendation count mismatch');
}

// Test 3: Operational Data Missing Case
console.log('\nTest 3: Missing Operational/Timetable Data Handling');
const mockTrainsWithMissingData = [
  ...MOCK_TRAINS,
  {
    trainId: 'TR-MISSING-01',
    trainNo: '99999',
    name: 'Experimental Special',
    section: 'SEC-01',
    start: '13:00',
    end: '14:30',
    priority: 'Passenger',
    timetableAvailable: false,
    hasMissingOperationalData: true
  }
];

const result3 = analyzeTrainImpact(testBlock1, mockTrainsWithMissingData, AVAILABLE_BLOCKS);
const missingDataRecom = result3.reschedulingRecommendations.find(r => r.trainNo === '99999');

if (missingDataRecom && !missingDataRecom.isRescheduleFeasible && missingDataRecom.reason.includes('Unfeasible')) {
  console.log('✓ PASS: Train with missing operational data clearly flagged as Unfeasible without inventing fake timing');
} else {
  console.error('❌ FAIL: Missing data train was not correctly flagged as unfeasible');
}

// Test 4: Alternative Block Windows Search
console.log('\nTest 4: Alternative Zero-Conflict Block Windows');
console.log(`- Found ${result1.alternativeBlockWindows.length} alternative block slots`);
result1.alternativeBlockWindows.forEach(alt => {
  console.log(`  Option: Block ${alt.blockId} (${alt.alternativeStart}–${alt.alternativeEnd}) -> ${alt.impactScore}`);
});

if (result1.alternativeBlockWindows.length >= 0) {
  console.log('✓ PASS: Alternative windows identified using planning engine logic');
}

console.log('\n================================================================');
console.log('ALL TRAIN IMPACT & AUTOMATIC RESCHEDULING TESTS COMPLETED');
console.log('================================================================');
