import test from 'node:test';
import assert from 'node:assert/strict';
import { createCircuitBreaker } from '../../modules/operations/circuit-breaker.mjs';

test('Sprint 184 circuit-breaker', async () => {
  const b=createCircuitBreaker({failureThreshold:1});await assert.rejects(()=>b.execute(async()=>{throw new Error('x')}));assert.equal(b.status().state,'open');
});
