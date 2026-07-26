import test from 'node:test';import assert from 'node:assert/strict';import {evaluateRegressionGate} from '../../modules/e2e/regression-gate.mjs';
test('Sprint 177 regression',()=>{assert.equal(evaluateRegressionGate({testsFailed:1,coverage:100}).allowed,false);});
