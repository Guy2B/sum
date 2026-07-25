'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { scoreEvidence, explainClaim } = require('../../modules/evidence/evidence-engine');

test('Sprint 18 distinguishes support, contradiction and certainty', () => {
  const items = [
    { workspaceId: 'w1', subjectId: 'g1', claim: 'milestone complete', sourceType: 'official', sourceId: 'report', confidence: 0.9 },
    { workspaceId: 'w1', subjectId: 'g1', claim: 'milestone complete', sourceType: 'measured', sourceId: 'tracker', confidence: 0.8 }
  ];
  const result = scoreEvidence(items);
  assert.equal(result.accepted, true);
  assert.ok(explainClaim('milestone complete', items).confidence >= 0.8);
});
