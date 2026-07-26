import test from 'node:test';
import assert from 'node:assert/strict';
import { createMetricsRegistry } from '../../modules/operations/metrics-registry.mjs';

test('Sprint 182 metrics', () => {
  const m=createMetricsRegistry();m.increment('x');assert.equal(m.snapshot().counters.x,1);
});
