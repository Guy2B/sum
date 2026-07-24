'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

global.SUM_EDITIONS = {
  normalize(value) {
    return String(value || 'solo');
  }
};

const editions = require('../../modules/decision-engine/editions');

function decision(overrides = {}) {
  return {
    signalId: 'mail:1',
    sourceType: 'mail',
    action: 'review',
    score: 50,
    priorityBand: 'medium',
    confidence: 90,
    classification: {
      intent: 'information',
      isPromotion: false
    },
    explanation: { reasons: [] },
    audit: {},
    dimensions: { effortMinutes: 15 },
    ...overrides
  };
}

test('Solo boosts client and invoice decisions', () => {
  const profile = editions.getProfile('solo');
  const adjusted = editions.applyToDecision(
    decision(),
    {
      id: 'mail:1',
      sourceType: 'mail',
      title: 'Client invoice payment overdue'
    },
    profile
  );

  assert.ok(adjusted.score > 50);
  assert.equal(adjusted.edition.key, 'solo');
  assert.ok(adjusted.edition.tags.includes('client'));
  assert.ok(adjusted.edition.tags.includes('money'));
});

test('Student prioritises an exam over a sales message', () => {
  const profile = editions.getProfile('student');

  const exam = editions.applyToDecision(
    decision({ signalId: 'task:exam', sourceType: 'task' }),
    {
      id: 'task:exam',
      sourceType: 'task',
      title: 'Réviser pour examen de statistiques',
      dueDate: '2026-07-24'
    },
    profile
  );

  const sales = editions.applyToDecision(
    decision({ signalId: 'mail:sales' }),
    {
      id: 'mail:sales',
      sourceType: 'mail',
      title: 'Client sales proposal and invoice'
    },
    profile
  );

  assert.ok(exam.score > sales.score);
});

test('Hard ignore rules are never overridden by an edition', () => {
  const adjusted = editions.applyToDecision(
    decision({
      action: 'ignore',
      score: 0,
      priorityBand: 'low',
      classification: {
        intent: 'promotion',
        isPromotion: true
      }
    }),
    {
      id: 'mail:promo',
      sourceType: 'mail',
      title: 'Client offer reward promotion'
    },
    editions.getProfile('solo')
  );

  assert.equal(adjusted.action, 'ignore');
  assert.equal(adjusted.score, 0);
  assert.equal(adjusted.edition.hardRulePreserved, true);
});

test('A future métier edition can be registered without changing the engine', () => {
  editions.registerProfile('jobseeker', {
    label: 'Σ Job Seeker',
    preferredTags: ['application', 'interview'],
    boosts: {
      application: 25,
      interview: 30
    }
  });

  const profile = editions.getProfile('jobseeker');
  assert.equal(profile.key, 'jobseeker');
  assert.equal(profile.label, 'Σ Job Seeker');
});

test('applyResult records the active edition', () => {
  global.SIGMA_DECISION_ENGINE = {
    selectToday(decisions, capacityMinutes) {
      return {
        items: decisions.filter((item) => item.score >= 45).slice(0, 3),
        capacityMinutes
      };
    }
  };

  const result = editions.applyResult(
    {
      decisions: [decision()],
      today: { items: [], capacityMinutes: 180 },
      diagnostics: {}
    },
    [{
      id: 'mail:1',
      sourceType: 'mail',
      title: 'Client invoice'
    }],
    {
      settings: { profile: 'solo' }
    },
    {
      capacityMinutes: 180
    }
  );

  assert.equal(result.edition.key, 'solo');
  assert.equal(result.diagnostics.editionProfile, 'solo');
  assert.equal(result.today.items.length, 1);
});
