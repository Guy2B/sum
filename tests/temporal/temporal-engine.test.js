'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { conflicts, freeSlots, temporalState } = require('../../modules/temporal/temporal-engine');

test('Sprint 17 detects conflicts and computes free time', () => {
  const events = [
    { id: 'a', start: '2026-07-24T09:00:00Z', end: '2026-07-24T10:00:00Z' },
    { id: 'b', start: '2026-07-24T09:30:00Z', end: '2026-07-24T11:00:00Z' }
  ];
  assert.deepEqual(conflicts(events), [{ leftId: 'a', rightId: 'b' }]);
  const slots = freeSlots(events, { start: '2026-07-24T08:00:00Z', end: '2026-07-24T12:00:00Z' }, { minimumMinutes: 30 });
  assert.equal(slots.length, 2);
  assert.equal(temporalState({ end: '2026-07-23T12:00:00Z' }, Date.parse('2026-07-24T12:00:00Z')), 'past');
});
