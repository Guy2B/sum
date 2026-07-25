'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { DomainAdapterFramework } = require('../../modules/domains/domain-adapter-framework');
test('Sprint 38 runs a domain adapter without bypassing approval', () => {
  const framework = new DomainAdapterFramework().register('health', {
    normalize: input => ({ steps: Number(input.steps) }), validate: value => ({ valid: value.steps >= 0 }),
    deriveSignals: value => [{ type: 'activity', value: value.steps }], generateInsights: ({ normalized }) => [{ message: `${normalized.steps} steps` }],
    proposeActions: () => [{ id: 'walk', action: 'Take a walk' }], explain: () => 'Derived from activity evidence'
  });
  const result = framework.run('health', { steps: '2000' });
  assert.equal(result.valid, true);
  assert.equal(result.actions[0].requiresApproval, true);
});
