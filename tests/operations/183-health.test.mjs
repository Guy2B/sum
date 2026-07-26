import test from 'node:test';
import assert from 'node:assert/strict';
import { runHealthChecks } from '../../modules/operations/health-checks.mjs';

test('Sprint 183 health', async () => {
  const r=await runHealthChecks({x:async()=>({ok:true})});assert.equal(r.healthy,true);
});
