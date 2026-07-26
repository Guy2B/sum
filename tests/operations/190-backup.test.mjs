import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBackupPlan, createBackupPlan } from '../../modules/operations/backup-plan.mjs';

test('Sprint 190 backup', () => {
  assert.equal(validateBackupPlan(createBackupPlan({targets:['signals']})).ok,true);
});
