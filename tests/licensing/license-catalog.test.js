import test from 'node:test';
import assert from 'node:assert/strict';
import { LicenseCatalog } from '../../modules/licensing/license-catalog.js';

test('Sprint 24 separates plans, prices, modules and quotas', () => {
  const catalog = new LicenseCatalog();
  catalog.addPlan({ id: 'free', price: 0, includedModules: ['core'], limits: { members: 1 } });
  catalog.addPlan({ id: 'pro', price: 19, includedModules: ['core', 'agenda'], limits: { members: 5 } });
  assert.deepEqual(catalog.compare('free', 'pro').addedModules, ['agenda']);
  assert.deepEqual(catalog.compare('free', 'pro').limitChanges.members, { from: 1, to: 5 });
});
