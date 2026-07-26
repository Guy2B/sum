import {runScenario} from './scenario-runner.mjs';
import {assertScenario} from './assertion-engine.mjs';
export async function runE2ESuite(scenarios=[],handlers={}){
 const results=[];
 for(const scenario of scenarios){
   try{const run=await runScenario(scenario,handlers);const assertion=assertScenario(run,scenario.expected||[]);results.push({...run,assertion,ok:assertion.ok});}
   catch(error){results.push({scenarioId:scenario.id,ok:false,error:error.message});}
 }
 return {total:results.length,passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok).length,results};
}
