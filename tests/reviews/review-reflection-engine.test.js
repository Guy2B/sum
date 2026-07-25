'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { ReviewReflectionEngine } = require('../../modules/reviews/review-reflection-engine');
test('Sprint 37 produces an evidence-oriented review', () => {
  const review = new ReviewReflectionEngine().build({ period: 'week-30', goals: [{ id: 'g', status: 'at-risk' }], tasks: [{ status: 'done' }, { status: 'blocked' }], decisions: [{ outcome: { result: 'worse-than-expected' } }] });
  assert.equal(review.metrics.completionRate, 0.5);
  assert.equal(review.goalsAtRisk.length, 1);
  assert.equal(review.requiresHumanReflection, true);
});
