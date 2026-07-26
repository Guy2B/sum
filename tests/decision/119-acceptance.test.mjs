import test from 'node:test';import assert from 'node:assert/strict';
import { runDecisionEngine } from '../../modules/decision/decision-engine.mjs';
import { validateDecisionEngine } from '../../modules/decision/product-acceptance.mjs';
test('Sprint 119 validates the complete decision flow',()=>{const r=runDecisionEngine({signal:{title:'Document important',priority:{level:'high',confidence:.9}},action:{title:'Préparer le document',kind:'review',priorityLevel:'high',estimatedMinutes:30},profile:{riskTolerance:'balanced',delegates:['assistant']},constraints:{budget:100}});assert.equal(validateDecisionEngine(r).ok,true);});
