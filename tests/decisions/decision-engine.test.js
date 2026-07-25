'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { DecisionEngine } = require('../../modules/decisions/decision-engine');
test('Sprint 35 ranks decisions with evidence and risk', () => {
  const engine = new DecisionEngine();
  const result = engine.evaluate({ id: 'd1', workspaceId: 'w', criteria: [{ id: 'value', weight: 1 }], options: [
    { id: 'safe', ratings: { value: 7 }, risks: [{ probability: 0.1, impact: 1 }], evidence: [{ confidence: 0.9 }] },
    { id: 'risky', ratings: { value: 8 }, risks: [{ probability: 1, impact: 3 }], evidence: [{ confidence: 0.5 }] }
  ]});
  assert.equal(result.recommendation, 'safe');
  assert.equal(result.requiresApproval, true);
});
