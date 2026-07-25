import test from 'node:test';
import assert from 'node:assert/strict';
import { ModuleRegistry } from '../../modules/catalog/module-registry.js';

test('Sprint 21 resolves module dependencies deterministically', () => {
  const registry = new ModuleRegistry();
  registry.register({ id: 'core', capabilities: ['identity'] });
  registry.register({ id: 'agenda', dependencies: ['core'], capabilities: ['calendar'] });
  assert.deepEqual(registry.resolve(['agenda']).map((item) => item.id), ['core', 'agenda']);
});
