import test from 'node:test';
import assert from 'node:assert/strict';
import { runLearningEngine } from '../../modules/learning/learning-engine.mjs';
import { validateLearningEngine } from '../../modules/learning/product-acceptance.mjs';

test('Sprint 164 acceptance', () => {
  const result = runLearningEngine({ events: [] });
  assert.equal(validateLearningEngine(result).ok, true);
});
