import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateReadiness } from '../../modules/operations/readiness-gate.mjs';

test('Sprint 192 readiness', () => {
  assert.equal(evaluateReadiness({health:{healthy:true},regression:{allowed:true},backup:{ok:true},migrations:{},security:{ok:true}}).ready,true);
});
