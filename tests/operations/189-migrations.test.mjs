import test from 'node:test';
import assert from 'node:assert/strict';
import { runMigrations } from '../../modules/operations/migration-runner.mjs';

test('Sprint 189 migrations', async () => {
  let x=0;const r=await runMigrations([{id:'001',up:async()=>x++}]);assert.equal(r.applied.length,1);assert.equal(x,1);
});
