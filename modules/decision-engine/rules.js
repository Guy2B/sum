'use strict';

(function initRules(root, factory) {
  const utils = typeof module === 'object' && module.exports
    ? require('./utils')
    : root.SIGMA_DECISION_UTILS;
  const api = factory(utils);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_DECISION_RULES = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(utils) {
  const RULES = [
    {
      id: 'suppress.promotion',
      priority: 100,
      when: (facts) => facts.isPromotion,
      effect: { score: -75, action: 'ignore', band: 'low' },
      reason: 'Promotional or newsletter content has no verified operational value'
    },
    {
      id: 'protect.automated',
      priority: 90,
      when: (facts) => facts.isAutomated && !['transactional'].includes(facts.intent),
      effect: { score: -25 },
      reason: 'Automated sender without a verified request'
    },
    {
      id: 'reply.strategic.relationship',
      priority: 85,
      when: (facts) =>
        facts.needsReply &&
        facts.relationshipValue >= 0.75 &&
        facts.waitingHours >= 24,
      effect: { score: 22, action: 'reply' },
      reason: 'A valuable relationship is waiting for a response'
    },
    {
      id: 'deadline.overdue',
      priority: 84,
      when: (facts) => facts.hoursToDue !== null && facts.hoursToDue < 0,
      effect: { score: 28, action: facts => facts.sourceType === 'mail' ? 'reply' : 'execute' },
      reason: 'The deadline has passed'
    },
    {
      id: 'deadline.today',
      priority: 82,
      when: (facts) =>
        facts.hoursToDue !== null &&
        facts.hoursToDue >= 0 &&
        facts.hoursToDue <= 24,
      effect: { score: 20, action: 'execute' },
      reason: 'The deadline is within 24 hours'
    },
    {
      id: 'prepare.meeting',
      priority: 78,
      when: (facts) =>
        facts.sourceType === 'event' &&
        facts.hoursToDue !== null &&
        facts.hoursToDue >= 0 &&
        facts.hoursToDue <= 24,
      effect: { score: 18, action: 'prepare' },
      reason: 'A near-term event may require preparation'
    },
    {
      id: 'opportunity.high.value',
      priority: 76,
      when: (facts) =>
        facts.intent === 'opportunity' &&
        (facts.commercialValue >= 0.5 || facts.relationshipValue >= 0.75),
      effect: { score: 18, action: facts => facts.needsReply ? 'reply' : 'review' },
      reason: 'Potential commercial value is material'
    },
    {
      id: 'quick.win',
      priority: 60,
      when: (facts) =>
        facts.effortMinutes <= 10 &&
        facts.impact >= 60 &&
        facts.confidence >= 65,
      effect: { score: 10 },
      reason: 'High-value action with low estimated effort'
    },
    {
      id: 'low.confidence.guardrail',
      priority: 95,
      when: (facts) => facts.confidence < 60,
      effect: { score: -20, action: 'review', requiresReview: true },
      reason: 'The evidence is incomplete, so human review is required'
    },
    {
      id: 'irreversible.guardrail',
      priority: 99,
      when: (facts) => facts.reversibility < 40,
      effect: { action: 'review', requiresReview: true },
      reason: 'Potentially irreversible action requires explicit approval'
    }
  ];

  function resolveEffect(effect, facts) {
    const result = { ...effect };
    if (typeof result.action === 'function') result.action = result.action(facts);
    return result;
  }

  function evaluateRules(facts, rules = RULES) {
    const matches = rules
      .filter((rule) => {
        try {
          return Boolean(rule.when(facts));
        } catch {
          return false;
        }
      })
      .sort((left, right) => right.priority - left.priority);

    let adjustment = 0;
    let action = null;
    let band = null;
    let requiresReview = false;

    const fired = matches.map((rule) => {
      const effect = resolveEffect(rule.effect || {}, facts);
      adjustment += Number(effect.score || 0);
      if (!action && effect.action) action = effect.action;
      if (!band && effect.band) band = effect.band;
      requiresReview = requiresReview || Boolean(effect.requiresReview);
      return {
        id: rule.id,
        priority: rule.priority,
        reason: rule.reason,
        effect
      };
    });

    return {
      adjustment: utils.clamp(adjustment, -85, 65),
      action,
      band,
      requiresReview,
      fired
    };
  }

  return { RULES, evaluateRules };
});
