'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { GoalOutcomeEngine } = require('../../modules/goals/goal-outcome-engine');
test('Sprint 33 evaluates weighted goal progress and risk', () => {
  const engine = new GoalOutcomeEngine();
  const goal = engine.createGoal({ id: 'g1', title: 'Launch', workspaceId: 'w1', targetAt: '2026-01-01', milestones: [{ weight: 1, progress: 1 }, { weight: 3, progress: 0 }] });
  const result = engine.evaluate(goal, { now: new Date('2026-02-01') });
  assert.equal(result.progress, 0.25);
  assert.equal(result.status, 'at-risk');
  assert.equal(result.requiresReview, true);
});
