'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createEntity, validateEntity, linkEntities } = require('../../modules/common/entity-model');

test('Sprint 16 common model enforces shared metadata', () => {
  const entity = createEntity('Project', { id: 'p1', owner: 'u1', workspaceId: 'w1', source: { id: 'manual', type: 'user' }, confidence: 0.8, privacyLevel: 'private' });
  assert.equal(validateEntity(entity).valid, true);
  const linked = linkEntities(entity, { type: 'supports', targetId: 'g1', confidence: 0.9 });
  assert.equal(linked.relationships.length, 1);
});
