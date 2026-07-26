import test from 'node:test';import assert from 'node:assert/strict';
import { updateDecisionPreferences,applyPreferenceBias } from '../../modules/decision/preference-learning.mjs';
test('Sprint 117 learns reversibly from feedback',()=>{const p=updateDecisionPreferences({}, {optionId:'schedule',accepted:true});assert.equal(p.optionAffinity.schedule,1);assert.equal(applyPreferenceBias(50,'schedule',p),52);});
