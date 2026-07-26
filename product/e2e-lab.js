import {buildGoldenScenarios} from '../modules/e2e/golden-scenarios.mjs';
import {runE2ESuite} from '../modules/e2e/e2e-engine.mjs';
const handlers=new Proxy({}, {get:(_,kind)=>async(input,state)=>({kind,input,stateKeys:Object.keys(state),status:'ok'})});
async function render(){const r=await runE2ESuite(buildGoldenScenarios(),handlers);document.querySelector('#summary').innerHTML=`<h2>${r.passed}/${r.total} scénarios réussis</h2>`;document.querySelector('#results').innerHTML=r.results.map(x=>`<article class="card ${x.ok?'ok':'fail'}"><strong>${x.scenarioId}</strong><p>${x.ok?'PASS':x.error}</p></article>`).join('');}
document.querySelector('#run').onclick=render;render();
