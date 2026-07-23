'use strict';

(function initFacts(root, factory) {
  const utils = typeof module === 'object' && module.exports
    ? require('./utils')
    : root.SIGMA_DECISION_UTILS;
  const knowledge = typeof module === 'object' && module.exports
    ? require('./knowledge')
    : root.SIGMA_DECISION_KNOWLEDGE;
  const api = factory(utils, knowledge);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_DECISION_FACTS = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(utils, knowledge) {
  function inferDueAt(signal) {
    return signal.dueAt || signal.dueDate || signal.startAt || signal.date || null;
  }

  function estimateEffort(signal) {
    const explicit = Number(signal.estimate || signal.estimatedMinutes || 0);
    if (explicit > 0) return utils.clamp(explicit, 1, 480);
    if (signal.sourceType === 'mail' || signal.sourceType === 'social') {
      return signal.needsReply ? 8 : 3;
    }
    if (signal.sourceType === 'event') return 20;
    if (signal.sourceType === 'task') return 30;
    return 15;
  }

  function buildFacts(signal, context = {}, now = new Date()) {
    const learned = knowledge.buildKnowledge(signal, context);
    const dueAt = inferDueAt(signal);
    const hoursToDue = utils.hoursUntil(dueAt, now);
    const age = utils.ageHours(signal.receivedAt || signal.createdAt, now);
    const waitingHours = Number(
      signal.waitingHours ||
      signal.daysWithoutReply * 24 ||
      (signal.needsReply ? age : 0)
    );

    const importance = utils.clamp(
      25 +
      learned.relationshipValue * 35 +
      learned.goalAlignment * 24 +
      learned.commercialValue * 16 +
      (signal.important || signal.essential ? 18 : 0) -
      (learned.isPromotion ? 55 : 0) -
      (learned.isAutomated ? 12 : 0)
    );

    let urgency = 12;
    if (hoursToDue !== null) {
      if (hoursToDue < 0) urgency = 96;
      else if (hoursToDue <= 6) urgency = 90;
      else if (hoursToDue <= 24) urgency = 78;
      else if (hoursToDue <= 48) urgency = 62;
      else if (hoursToDue <= 168) urgency = 40;
    }
    if (signal.urgent) urgency = Math.max(urgency, 82);
    if (signal.needsReply && waitingHours >= 48) urgency += 18;
    else if (signal.needsReply && waitingHours >= 24) urgency += 10;
    if (learned.isPromotion) urgency = Math.min(urgency, 8);

    const impact = utils.clamp(
      18 +
      learned.goalAlignment * 32 +
      learned.relationshipValue * 22 +
      learned.commercialValue * 28 +
      (signal.riskLevel === 'high' ? 22 : signal.riskLevel === 'medium' ? 10 : 0) -
      (learned.isPromotion ? 45 : 0)
    );

    const costOfInaction = utils.clamp(
      urgency * 0.38 +
      impact * 0.42 +
      learned.relationshipValue * 20 +
      (signal.needsReply ? 10 : 0)
    );

    const sourceConfidence = learned.sourceTrust;
    const dataCompleteness = [
      Boolean(signal.title || signal.subject),
      Boolean(signal.sender || signal.sourceType === 'task'),
      Boolean(signal.receivedAt || signal.createdAt || dueAt),
      Boolean(signal.category || learned.intent)
    ].filter(Boolean).length / 4;

    const confidence = utils.clamp(
      (sourceConfidence * 0.55 + dataCompleteness * 0.45) * 100
    );

    const effortMinutes = estimateEffort(signal);
    const reversibility = signal.irreversible ? 15 : signal.reversible === false ? 35 : 82;

    return {
      ...signal,
      intent: learned.intent,
      relationshipType: learned.relationshipType,
      relationshipValue: learned.relationshipValue,
      sourceTrust: learned.sourceTrust,
      goalAlignment: learned.goalAlignment,
      commercialValue: learned.commercialValue,
      isPromotion: learned.isPromotion,
      isAutomated: learned.isAutomated,
      dueAt,
      hoursToDue,
      ageHours: age,
      waitingHours,
      importance: utils.round(importance),
      urgency: utils.round(utils.clamp(urgency)),
      impact: utils.round(impact),
      costOfInaction: utils.round(costOfInaction),
      confidence: utils.round(confidence),
      effortMinutes,
      reversibility
    };
  }

  return { buildFacts, estimateEffort, inferDueAt };
});
