import test from 'node:test';import assert from 'node:assert/strict';import {runScenario} from '../../modules/e2e/scenario-runner.mjs';
test('Sprint 167 runner',async ()=>{const r=await runScenario({id:'x',steps:[{kind:'a',input:1}]},{a:async x=>x+1});assert.equal(r.state.a,2);});
