import test from 'node:test';
import assert from 'node:assert/strict';
import { realSignalAcceptance } from '../../modules/release/real-signal-acceptance.js';

test('Sprint 89 accepts complete safe scenarios', () => {
  assert.equal(realSignalAcceptance({signal:{id:'1'},explanation:{reasons:[]},action:{type:'review',requiresApproval:false},edition:'family'}).ok, true);
});
test('Sprint 89 rejects unsafe autonomous external actions', () => {
  assert.equal(realSignalAcceptance({signal:{id:'1'},explanation:{},action:{type:'pay',requiresApproval:false},edition:'personal'}).ok, false);
});
