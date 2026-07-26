import test from 'node:test';
import assert from 'node:assert/strict';
import { createShutdownManager } from '../../modules/operations/shutdown-manager.mjs';

test('Sprint 188 shutdown', async () => {
  const s=createShutdownManager();let x=0;s.register('x',async()=>x++);const r=await s.shutdown();assert.equal(r.ok,true);assert.equal(x,1);
});
