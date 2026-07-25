'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { AttentionEngine } = require('../../modules/attention/attention-engine');
test('Sprint 36 groups alerts and respects cooldown', () => {
  const engine = new AttentionEngine({ cooldownMinutes: 60, maxPerGroup: 2 });
  const now = new Date('2026-07-25T12:00:00Z');
  const groups = engine.prioritize([
    { id: '1', type: 'mail', groupKey: 'inbox', level: 'normal', lastDeliveredAt: '2026-07-25T11:30:00Z' },
    { id: '2', type: 'mail', groupKey: 'inbox', level: 'urgent', lastDeliveredAt: '2026-07-25T11:30:00Z' }
  ], { now });
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].items.map(item => item.id), ['2']);
});
