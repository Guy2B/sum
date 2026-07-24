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
        explain: require('./explain'),
        arbitrator: require('./arbitrator'),
        provenance: require('./provenance'),
        knowledgeGraph: require('../entity-engine/graph'),
        graphContext: require('../entity-engine/context')
      }
    : {
        utils: root.SIGMA_DECISION_UTILS,
        behavior: root.SIGMA_DECISION_BEHAVIOR,
        facts: root.SIGMA_DECISION_FACTS,
        rules: root.SIGMA_DECISION_RULES,
        scorer: root.SIGMA_DECISION_SCORER,
        explain: root.SIGMA_DECISION_EXPLAIN,
        arbitrator: root.SIGMA_DECISION_ARBITRATOR,
        provenance: root.SIGMA_SIGNAL_PROVENANCE,
        knowledgeGraph: root.SIGMA_KNOWLEDGE_GRAPH,
        graphContext: root.SIGMA_GRAPH_CONTEXT
      };
  const api = factory(deps);
  if (isNode) module.exports = api;
  else root.SIGMA_DECISION_ENGINE = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(deps) {
  const { utils, behavior, facts, rules, scorer, explain } = deps;

  function resolveKnowledgeGraph() {
    return deps.knowledgeGraph ||
      (typeof globalThis !== 'undefined'
        ? globalThis.SIGMA_KNOWLEDGE_GRAPH
        : undefined);
  }

  function resolveGraphContext() {
    return deps.graphContext ||
      (typeof globalThis !== 'undefined'
        ? globalThis.SIGMA_GRAPH_CONTEXT
        : undefined);
  }

  function resolveProvenance() {
    return deps.provenance ||
      (typeof globalThis !== 'undefined'
        ? globalThis.SIGMA_SIGNAL_PROVENANCE
        : undefined);
  }

  function resolveArbitrator() {
    return deps.arbitrator ||
      (typeof globalThis !== 'undefined'
        ? globalThis.SIGMA_DECISION_ARBITRATOR
        : undefined);
  }

  function defaultAction(factSet) {
    if (factSet.isPromotion) return 'ignore';
    if (factSet.needsReply) return 'reply';
    if (factSet.sourceType === 'event') return 'prepare';
    if (factSet.sourceType === 'task') return 'execute';
    if (['money', 'finance'].includes(factSet.sourceType)) return 'review';
    if (['health', 'wellbeing'].includes(factSet.sourceType)) return 'adjust';
    if (factSet.sourceType === 'learning') return 'learn';
    return 'review';
  }

  function decide(signal, context = {}, options = {}) {
    if (!signal || !signal.id) {
      throw new TypeError('Sigma Decision Engine requires a signal with a stable id');
    }

    const now = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
    // Hard guardrail: ignore imported YouTube subscriptions
if (
  signal.category === 'youtube_subscription' ||
  String(signal.id || '').includes('youtube_subscription') ||
  (
    signal.sourceType === 'social' &&
    signal.socialType === 'subscription'
  )
) {
  return {
    id: `decision:${signal.id}`,
    signalId: signal.id,
    sourceType: signal.sourceType || 'social',
    title: signal.title || '',
    subject: signal.subject || signal.title || '',
    sender: signal.sender || '',
    action: 'ignore',
    status: 'proposed',
    score: 0,
    priorityBand: 'low',
    confidence: 1,
    requiresApproval: false,
    requiresReview: false,
    dimensions: {},
    classification: {
      intent: 'information',
      relationshipType: 'none',
      isPromotion: false,
      isAutomated: true
    },
    formula: null,
    explanation: 'YouTube subscription ignored by hard guardrail.',
    rules: ['guardrail.youtube.subscription'],
    behavior: {
      adjustment: 0,
      confidence: 1,
      profileReady: false
    },
    audit: {
      engineVersion: '8.0.0',
      generatedAt: now.toISOString(),
      automaticExternalAction: false
    }
  };
}
    const behaviorProfile = options.behaviorProfile ||
      behavior.learnProfile(context.observations || context.feedback || []);
    const factSet = facts.buildFacts(signal, context, now);
    const behaviorResult = behavior.behaviorAdjustment(factSet, behaviorProfile, now);
    const ruleResult = rules.evaluateRules(factSet, options.rules || rules.RULES);
    const scored = scorer.scoreDecision(factSet, ruleResult, behaviorResult);
    const action = ruleResult.action || defaultAction(factSet);
    const requiresApproval =
      options.requireApproval !== false &&
      !['ignore', 'review', 'adjust', 'learn'].includes(action);

    const explanation = explain.buildExplanation(
      factSet,
      ruleResult,
      behaviorResult,
      scored
    );

    return {
      id: `decision:${signal.id}`,
      signalId: signal.id,
      sourceType: signal.sourceType || 'generic',
      title: signal.title || signal.subject || '',
      subject: signal.subject || signal.title || '',
      sender: signal.sender || '',
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
        engineVersion: '8.0.0',
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
          return sameType && sameAction && titleSimilarity >= 0.78;
        });
        if (!duplicate) result.push(decision);
      });
    return result;
  }

  function selectToday(decisions = [], capacityMinutes = 180, options = {}) {
    const arbitrator = resolveArbitrator();
    if (!arbitrator?.arbitrate) {
      throw new Error(
        'Sigma Universal Signal Arbitrator is not loaded. ' +
        'Load modules/decision-engine/arbitrator.js before calling decideMany().'
      );
    }
    return arbitrator.arbitrate(decisions, {
      ...options,
      capacityMinutes
    });
  }

  function decideMany(signals = [], context = {}, options = {}) {
    const provenance = resolveProvenance();
    const normalizedSignals = signals.map((signal) =>
      provenance?.attach
        ? provenance.attach(signal, {
            importedAt: options.importedAt || new Date()
          })
        : signal
    );

    const behaviorProfile = options.behaviorProfile ||
      behavior.learnProfile(context.observations || context.feedback || []);
    const decisions = normalizedSignals.map((signal) => {
      const decision = decide(signal, context, { ...options, behaviorProfile });
      decision._signalText = `${signal.title || signal.subject || ''} ${signal.sender || ''} ${signal.body || ''}`;
      return decision;
    });

    const knowledgeGraphApi = resolveKnowledgeGraph();
    const graphContext = resolveGraphContext();
    const knowledgeGraph = knowledgeGraphApi?.build
      ? knowledgeGraphApi.build(normalizedSignals, options.knowledgeGraph || {})
      : null;

    const deduplicated = deduplicate(decisions);
    const ranked = knowledgeGraph && graphContext?.enrichDecisions
      ? graphContext.enrichDecisions(
          deduplicated,
          knowledgeGraph,
          context
        )
      : deduplicated.sort((left, right) =>
          right.score - left.score ||
          right.confidence - left.confidence
        );

    const today = selectToday(
      ranked,
      options.capacityMinutes || 180,
      options.arbitration || {}
    );

    const cleanRanked = ranked.map(({ _signalText, ...decision }) => decision);

    return {
      decisions: cleanRanked,
      today: {
        ...today,
        items: today.items.map(({ _signalText, ...decision }) => decision)
      },
      behaviorProfile,
      normalizedSignals,
      knowledgeGraph,
      rejected: today.rejected || [],
      diagnostics: {
        inputSignals: signals.length,
        normalizedSignals: normalizedSignals.length,
        rankedDecisions: cleanRanked.length,
        suppressedPromotions: cleanRanked.filter(
          (decision) => decision.classification.isPromotion
        ).length,
        sourceDistribution: normalizedSignals.reduce((acc, signal) => {
          const arbitrator = resolveArbitrator();
          const key = arbitrator?.sourceFamily
            ? arbitrator.sourceFamily(signal.sourceType)
            : String(signal.sourceType || 'generic').toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {}),
        provenance: provenance?.summarize
          ? provenance.summarize(normalizedSignals)
          : null,
        knowledgeGraph: knowledgeGraphApi?.summarize && knowledgeGraph
          ? knowledgeGraphApi.summarize(knowledgeGraph)
          : null,
        arbitration: today.audit
      }
    };
  }

  return {
    version: '8.0.0',
    decide,
    decideMany,
    selectToday,
    arbitrate(...args) {
      const arbitrator = resolveArbitrator();
      if (!arbitrator?.arbitrate) {
        throw new Error('Sigma Universal Signal Arbitrator is not loaded');
      }
      return arbitrator.arbitrate(...args);
    },
    learnBehaviorProfile: behavior.learnProfile
  };
});
