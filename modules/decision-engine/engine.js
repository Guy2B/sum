'use strict';

(function initEngine(root, factory) {
  const isNode = typeof module === 'object' && module.exports;
  const deps = isNode
    ? {
        utils: require('./utils'),
        behavior: require('./behavior'),
        facts: require('./facts'),
        rules: require('./rules'),
        scorer: require('./scorer'),
        explain: require('./explain')
      }
    : {
        utils: root.SIGMA_DECISION_UTILS,
        behavior: root.SIGMA_DECISION_BEHAVIOR,
        facts: root.SIGMA_DECISION_FACTS,
        rules: root.SIGMA_DECISION_RULES,
        scorer: root.SIGMA_DECISION_SCORER,
        explain: root.SIGMA_DECISION_EXPLAIN
      };
  const api = factory(deps);
  if (isNode) module.exports = api;
  else root.SIGMA_DECISION_ENGINE = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(deps) {
  const { utils, behavior, facts, rules, scorer, explain } = deps;

  function defaultAction(factSet) {
    if (factSet.isPromotion) return 'ignore';
    if (factSet.needsReply) return 'reply';
    if (factSet.sourceType === 'event') return 'prepare';
    if (factSet.sourceType === 'task') return 'execute';
    return 'review';
  }

  function decide(signal, context = {}, options = {}) {
    if (!signal || !signal.id) {
      throw new TypeError('Sigma Decision Engine requires a signal with a stable id');
    }

    const now = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
    const behaviorProfile = options.behaviorProfile ||
      behavior.learnProfile(context.observations || context.feedback || []);
    const factSet = facts.buildFacts(signal, context, now);
    const behaviorResult = behavior.behaviorAdjustment(factSet, behaviorProfile, now);
    const ruleResult = rules.evaluateRules(factSet, options.rules || rules.RULES);
    const scored = scorer.scoreDecision(factSet, ruleResult, behaviorResult);
    const action = ruleResult.action || defaultAction(factSet);
    const requiresApproval =
      options.requireApproval !== false &&
      !['ignore', 'review'].includes(action);

    const explanation = explain.buildExplanation(
      factSet,
      ruleResult,
      behaviorResult,
      scored
    );

    return {
      id: `decision:${signal.id}`,
      signalId: signal.id,
      sourceType: signal.sourceType,
      action,
      status: 'proposed',
      score: scored.score,
      priorityBand: scored.band,
      confidence: factSet.confidence,
      requiresApproval,
      requiresReview: Boolean(ruleResult.requiresReview),
      dimensions: {
        importance: factSet.importance,
        urgency: factSet.urgency,
        impact: factSet.impact,
        costOfInaction: factSet.costOfInaction,
        effortMinutes: factSet.effortMinutes,
        reversibility: factSet.reversibility
      },
      classification: {
        intent: factSet.intent,
        relationshipType: factSet.relationshipType,
        isPromotion: factSet.isPromotion,
        isAutomated: factSet.isAutomated
      },
      formula: scored.formula,
      explanation,
      rules: ruleResult.fired,
      behavior: {
        adjustment: behaviorResult.adjustment,
        confidence: behaviorResult.confidence,
        profileReady: Boolean(behaviorProfile.ready)
      },
      audit: {
        engineVersion: '6.0.0',
        generatedAt: now.toISOString(),
        sourceTrust: factSet.sourceTrust,
        dataPolicy: 'observed-context-only',
        sensitiveDemographicsUsed: false,
        automaticExternalAction: false
      }
    };
  }

  function deduplicate(decisions) {
    const result = [];
    [...decisions]
      .sort((left, right) => right.score - left.score)
      .forEach((decision) => {
        const duplicate = result.find((existing) => {
          const sameType = existing.sourceType === decision.sourceType;
          const sameAction = existing.action === decision.action;
          const titleSimilarity = utils.similarity(
            existing._signalText || '',
            decision._signalText || ''
          );
          return sameType && sameAction && titleSimilarity >= 0.72;
        });
        if (!duplicate) result.push(decision);
      });
    return result;
  }

  function decideMany(signals = [], context = {}, options = {}) {
    const behaviorProfile = options.behaviorProfile ||
      behavior.learnProfile(context.observations || context.feedback || []);
    const decisions = signals.map((signal) => {
      const decision = decide(signal, context, { ...options, behaviorProfile });
      decision._signalText = `${signal.title || signal.subject || ''} ${signal.sender || ''}`;
      return decision;
    });

    const ranked = deduplicate(decisions)
      .sort((left, right) =>
        right.score - left.score ||
        right.confidence - left.confidence
      )
      .map(({ _signalText, ...decision }) => decision);

    return {
      decisions: ranked,
      today: selectToday(ranked, options.capacityMinutes || 180),
      behaviorProfile,
      diagnostics: {
        inputSignals: signals.length,
        rankedDecisions: ranked.length,
        suppressedPromotions: ranked.filter(
          (decision) => decision.classification.isPromotion
        ).length
      }
    };
  }

  function selectToday(decisions = [], capacityMinutes = 180) {
    const selected = [];
    let usedMinutes = 0;
    const bucketCounts = new Map();

    for (const decision of decisions) {
      if (decision.priorityBand === 'low' || decision.action === 'ignore') continue;
      const bucket = decision.action;
      const count = bucketCounts.get(bucket) || 0;
      if (count >= 2 && selected.length < 3) continue;

      const effort = decision.dimensions.effortMinutes || 15;
      if (selected.length > 0 && usedMinutes + effort > capacityMinutes) continue;

      selected.push(decision);
      usedMinutes += effort;
      bucketCounts.set(bucket, count + 1);
      if (selected.length >= 3) break;
    }

    return {
      items: selected,
      usedMinutes,
      capacityMinutes,
      remainingMinutes: Math.max(0, capacityMinutes - usedMinutes)
    };
  }

  return {
    version: '6.0.0',
    decide,
    decideMany,
    selectToday,
    learnBehaviorProfile: behavior.learnProfile
  };
});
