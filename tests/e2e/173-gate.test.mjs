import test from 'node:test';import assert from 'node:assert/strict';import {evaluateRegressionGate} from '../../modules/e2e/regression-gate.mjs';
test('Sprint 173 gate',()=>{assert.equal(evaluateRegressionGate({testsPassed:10,testsFailed:0,coverage:90}).allowed,true);});
