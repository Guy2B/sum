'use strict';

(function initScorer(root, factory) {
  const utils = typeof module === 'object' && module.exports
    ? require('./utils')
    : root.SIGMA_DECISION_UTILS;
  const api = factory(utils);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_DECISION_SCORER = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(utils) {
  function baseScore(facts) {
    const opportunityBoost = facts.intent === 'opportunity'
      ? facts.commercialValue * 8
      : 0;
    const efficiency = utils.clamp(100 - facts.effortMinutes * 1.25);
    return utils.weightedAverage([
      { value: facts.importance, weight: 0.27 },
      { value: facts.urgency, weight: 0.25 },
      { value: facts.impact, weight: 0.20 },
      { value: facts.costOfInaction, weight: 0.14 },
      { value: efficiency, weight: 0.06 },
      { value: facts.confidence, weight: 0.08 }
    ]) + opportunityBoost;
  }

  function scoreDecision(facts, ruleResult, behaviorResult) {
    const rawBase = baseScore(facts);
    const ruleAdjustment = Number(ruleResult?.adjustment || 0);
    const behaviorAdjustment = Number(behaviorResult?.adjustment || 0);
    const confidencePenalty = facts.confidence < 60
      ? (60 - facts.confidence) * 0.28
      : 0;
    const finalScore = utils.clamp(
      rawBase + ruleAdjustment + behaviorAdjustment - confidencePenalty
    );

    let band = ruleResult?.band;
    if (!band) {
      if (finalScore >= 82) band = 'critical';
      else if (finalScore >= 67) band = 'high';
      else if (finalScore >= 48) band = 'medium';
      else band = 'low';
    }

    return {
      score: utils.round(finalScore),
      band,
      formula: {
        base: utils.round(rawBase, 1),
        ruleAdjustment: utils.round(ruleAdjustment, 1),
        behaviorAdjustment: utils.round(behaviorAdjustment, 1),
        confidencePenalty: utils.round(confidencePenalty, 1)
      }
    };
  }

  return { baseScore, scoreDecision };
});
