'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { authorize, retentionState, redact } = require('../../modules/privacy/privacy-engine');

test('Sprint 19 enforces workspace, purpose and retention', () => {
  const resource = { workspaceId: 'w1', owner: 'u1', privacyLevel: 'sensitive', createdAt: '2026-01-01T00:00:00Z', secret: 'value' };
  const denied = authorize({ userId: 'u2', workspaceId: 'w1', role: 'member', purpose: 'operate' }, resource, 'read', { maximumPrivacyLevel: 'sensitive' });
  assert.equal(denied.allowed, false);
  assert.equal(retentionState(resource, { retentionDays: 30 }, Date.parse('2026-03-01T00:00:00Z')).expired, true);
  assert.equal(redact(resource, ['secret']).secret, '[REDACTED]');
});
