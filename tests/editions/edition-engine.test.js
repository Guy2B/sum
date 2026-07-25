import test from 'node:test';
import assert from 'node:assert/strict';
import { ModuleRegistry } from '../../modules/catalog/module-registry.js';
import { EditionEngine } from '../../modules/editions/edition-engine.js';

test('Sprint 22 materializes an edition from shared modules', () => {
  const registry = new ModuleRegistry();
  registry.register({ id: 'core' });
  registry.register({ id: 'learning', dependencies: ['core'] });
  const editions = new EditionEngine({ moduleRegistry: registry });
  editions.register({ id: 'student', modules: ['learning'] });
  assert.deepEqual(editions.materialize('student').modules.map((item) => item.id), ['core', 'learning']);
});
