import { runPlanningEngine, findIntegratedBlockForGroup } from './src/utils/planningEngine.js';
import { INITIAL_REQUESTS, MOCK_TRAINS, AVAILABLE_BLOCKS } from './src/data/mockData.js';

console.log('Testing Integrated Planning Engine...');
const result = runPlanningEngine(INITIAL_REQUESTS, MOCK_TRAINS, AVAILABLE_BLOCKS);

console.log('--- METRICS ---');
console.log(JSON.stringify(result.metrics, null, 2));

console.log('--- INTEGRATED BLOCKS ---');
result.integratedBlocks.forEach(ib => {
  console.log(`[${ib.id}] Section: ${ib.section} | Block: ${ib.blockId} | Time: ${ib.start} - ${ib.end} (${ib.durationMinutes}m) | Separate Blocks Avoided: ${ib.separateBlocksAvoided}`);
  console.log(`  Departments: ${ib.departments.join(' + ')}`);
  console.log(`  Requests: ${ib.requestIds.join(', ')}`);
  console.log(`  Explanation: ${ib.explanation}`);
});

console.log('--- PLANNED REQUESTS ---');
result.requests.forEach(r => {
  console.log(`${r.id} (${r.department} - ${r.section}) -> Status: ${r.status} | Block: ${r.recommendation?.recommendedBlockId} (${r.recommendation?.recommendedStart}-${r.recommendation?.recommendedEnd}) | Integrated: ${r.recommendation?.isIntegrated ? r.recommendation?.integratedBlockId : 'No'}`);
});
