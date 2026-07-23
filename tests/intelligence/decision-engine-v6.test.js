'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const engine = require('../../modules/decision-engine/engine');

const now = new Date('2026-07-23T10:00:00Z');

test('suppresses promotional email even when unread', () => {
  const result = engine.decide({
    id: 'promo-1',
    sourceType: 'mail',
    title: 'Quick reminder: Your feedback comes with a reward',
    body: 'Complete our survey and receive a reward. Unsubscribe.',
    sender: 'Holafly <noreply@emailserver.com>',
    receivedAt: '2026-07-23T08:00:00Z',
    unread: true,
    needsReply: false
  }, {}, { now });

  assert.equal(result.classification.isPromotion, true);
  assert.equal(result.action, 'ignore');
  assert.equal(result.priorityBand, 'low');
  assert.ok(result.score < 30);
});

test('prioritizes a strategic client waiting for a reply', () => {
  const result = engine.decide({
    id: 'client-1',
    sourceType: 'mail',
    title: 'Validation du devis Sigma',
    body: 'Pouvez-vous confirmer avant notre réunion demain ?',
    sender: 'Jean Dupont <jean@example.com>',
    receivedAt: '2026-07-21T08:00:00Z',
    needsReply: true,
    opportunityValue: 18000,
    dueAt: '2026-07-24T09:00:00Z'
  }, {
    primaryGoal: 'Signer de nouveaux clients Sigma',
    relationships: [{
      email: 'jean@example.com',
      relationshipType: 'strategic_client'
    }]
  }, { now });

  assert.equal(result.action, 'reply');
  assert.ok(result.score >= 75);
  assert.ok(result.explanation.reasons.length > 0);
  assert.equal(result.requiresApproval, true);
});

test('requires review when evidence is incomplete', () => {
  const result = engine.decide({
    id: 'unknown-1',
    sourceType: 'social',
    title: 'Urgent',
    urgent: true
  }, {}, { now });

  assert.equal(result.requiresReview, true);
  assert.ok(result.confidence < 65);
});

test('does not personalize before enough observations', () => {
  const profile = engine.learnBehaviorProfile([
    { action: 'accepted', sourceType: 'mail' },
    { action: 'rejected', sourceType: 'social' }
  ]);

  assert.equal(profile.ready, false);
  assert.equal(profile.observationCount, 2);
});

test('learns behavior only from repeated observed outcomes', () => {
  const observations = Array.from({ length: 8 }, (_, index) => ({
    action: 'accepted',
    sourceType: 'mail',
    intent: 'request',
    hour: 9,
    createdAt: `2026-07-${10 + index}T09:00:00Z`
  }));

  const profile = engine.learnBehaviorProfile(observations);
  const result = engine.decide({
    id: 'mail-behavior',
    sourceType: 'mail',
    title: 'Question client',
    sender: 'client@example.com',
    receivedAt: '2026-07-23T07:00:00Z',
    needsReply: true
  }, { observations }, { now, behaviorProfile: profile });

  assert.equal(profile.ready, true);
  assert.ok(result.behavior.adjustment > 0);
  assert.equal(result.audit.sensitiveDemographicsUsed, false);
});

test('never marks external actions as automatic', () => {
  const result = engine.decide({
    id: 'task-1',
    sourceType: 'task',
    title: 'Envoyer la proposition',
    dueAt: '2026-07-23T12:00:00Z',
    urgent: true,
    important: true,
    userCreated: true
  }, {}, { now });

  assert.equal(result.audit.automaticExternalAction, false);
  assert.equal(result.requiresApproval, true);
});

test('selects a capacity-limited today list', () => {
  const payload = engine.decideMany([
    {
      id: 'a',
      sourceType: 'task',
      title: 'Task A',
      dueAt: '2026-07-23T11:00:00Z',
      estimate: 60,
      urgent: true,
      important: true,
      userCreated: true
    },
    {
      id: 'b',
      sourceType: 'task',
      title: 'Task B',
      dueAt: '2026-07-23T12:00:00Z',
      estimate: 60,
      urgent: true,
      important: true,
      userCreated: true
    },
    {
      id: 'c',
      sourceType: 'task',
      title: 'Task C',
      dueAt: '2026-07-23T13:00:00Z',
      estimate: 60,
      urgent: true,
      important: true,
      userCreated: true
    }
  ], {}, { now, capacityMinutes: 120 });

  assert.ok(payload.today.usedMinutes <= 120);
  assert.ok(payload.today.items.length <= 3);
});
