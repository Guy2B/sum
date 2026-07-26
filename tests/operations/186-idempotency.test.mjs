import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdempotencyStore } from '../../modules/operations/idempotency-store.mjs';

test('Sprint 186 idempotency', () => {
  const s=createIdempotencyStore();s.set('x',1);assert.equal(s.get('x'),1);
});
