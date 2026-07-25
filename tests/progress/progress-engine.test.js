'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { assessProgress, nextReview } = require('../../modules/progress/progress-engine');

test('Sprint 20 reports weighted progress, confidence and trend', () => {
  const result = assessProgress([
    { workspaceId: 'w1', goalId: 'g1', metric: 'course', value: 40, confidence: 0.8, kind: 'measured', measuredAt: '2026-07-01T00:00:00Z' },
    { workspaceId: 'w1', goalId: 'g1', metric: 'course', value: 70, confidence: 0.9, kind: 'measured', measuredAt: '2026-07-20T00:00:00Z' }
  ]);
  assert.equal(result.trend, 'improving');
  assert.ok(result.progress > 50);
  assert.match(nextReview(result, { now: Date.parse('2026-07-24T00:00:00Z') }), /^2026-07-31/);
});
