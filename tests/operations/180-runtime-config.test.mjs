import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRuntimeConfig } from '../../modules/operations/runtime-config.mjs';

test('Sprint 180 runtime-config', () => {
  assert.equal(loadRuntimeConfig({environment:'production'}).environment,'production');
});
