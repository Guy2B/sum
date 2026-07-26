import test from 'node:test';import assert from 'node:assert/strict';import {calculateScenarioCoverage} from '../../modules/e2e/coverage-model.mjs';
test('Sprint 172 coverage',()=>{assert.equal(calculateScenarioCoverage([{steps:[{kind:'a'}]}],['a','b']).score,50);});
