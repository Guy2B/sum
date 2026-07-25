import test from 'node:test';
import assert from 'node:assert/strict';
import { ModuleRegistry } from '../../modules/catalog/module-registry.js';
import { EditionEngine } from '../../modules/editions/edition-engine.js';
import { FeatureFlagEngine } from '../../modules/features/feature-flag-engine.js';
import { LicenseCatalog } from '../../modules/licensing/license-catalog.js';
import { EntitlementEngine } from '../../modules/entitlements/entitlement-engine.js';

test('Sprint 25 grants only modules allowed by edition and commercial plan', () => {
  const registry = new ModuleRegistry();
  registry.register({ id: 'core' });
  registry.register({ id: 'agenda', dependencies: ['core'], capabilities: ['advanced-planning'] });
  registry.register({ id: 'career', dependencies: ['core'] });
  const editions = new EditionEngine({ moduleRegistry: registry });
  editions.register({ id: 'solo', modules: ['agenda', 'career'] });
  const flags = new FeatureFlagEngine();
  flags.define({ key: 'advanced-planning', defaultValue: true });
  const licenses = new LicenseCatalog();
  licenses.addPlan({ id: 'starter', includedModules: ['core', 'agenda'], limits: { actionsPerDay: 20 } });
  const engine = new EntitlementEngine({ moduleRegistry: registry, editionEngine: editions, licenseCatalog: licenses, featureFlags: flags });
  const result = engine.resolve({ editionId: 'solo', planId: 'starter' });
  assert.deepEqual(result.decision.allowed, ['core', 'agenda']);
  assert.deepEqual(result.decision.denied, ['career']);
  assert.equal(result.features['advanced-planning'].enabled, true);
});
