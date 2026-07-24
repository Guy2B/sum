'use strict';

(function initUniversalArbitrator(root, factory) {
  const utils = typeof module === 'object' && module.exports
    ? require('./utils')
    : root.SIGMA_DECISION_UTILS;
  const api = factory(utils);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_DECISION_ARBITRATOR = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(utils) {
  const DEFAULT_SOURCE_LIMITS = Object.freeze({
    mail: 1,
    social: 1,
    task: 2,
    event: 2,
    money: 2,
    finance: 2,
    learning: 1,
    health: 1,
    wellbeing: 1,
    mobility: 1,
    project: 2,
    habit: 1,
    manual: 2,
    system: 1,
    generic: 1
  });

  function sourceFamily(value) {
    const source = String(value || 'generic').toLowerCase();
    const aliases = {
      email: 'mail',
      calendar: 'event',
      financial: 'finance',
      transaction: 'money',
      wellness: 'wellbeing',
      location: 'mobility',
      notification: 'system'
    };
    return aliases[source] || source;
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function topicText(decision) {
    return normalizeText([
      decision.title,
      decision.subject,
      decision.sender,
      decision.classification?.intent,
      decision.sourceType,
      decision._signalText
    ].filter(Boolean).join(' '));
  }

  function clusterDecisions(decisions = [], threshold = 0.64) {
    const clusters = [];

    [...decisions]
      .sort((a, b) => b.score - a.score)
      .forEach((decision) => {
        const text = topicText(decision);
        const existing = clusters.find((cluster) =>
          utils.similarity(cluster.text, text) >= threshold
        );

        if (existing) {
          existing.items.push(decision);
          existing.sources.add(sourceFamily(decision.sourceType));
          if (decision.score > existing.primary.score) {
            existing.primary = decision;
            existing.text = text;
          }
        } else {
          clusters.push({
            id: `cluster:${clusters.length + 1}`,
            text,
            primary: decision,
            items: [decision],
            sources: new Set([sourceFamily(decision.sourceType)])
          });
        }
      });

    return clusters.map((cluster) => ({
      ...cluster,
      sources: [...cluster.sources]
    }));
  }

  function applyCrossSourceEvidence(cluster) {
    const corroboratingSources = Math.max(0, cluster.sources.length - 1);
    const corroborationBoost = Math.min(12, corroboratingSources * 5);
    const primary = cluster.primary;

    return {
      ...primary,
      score: utils.round(utils.clamp(primary.score + corroborationBoost)),
      arbitration: {
        clusterId: cluster.id,
        corroboratingSignalIds: cluster.items
          .filter((item) => item.signalId !== primary.signalId)
          .map((item) => item.signalId),
        sourceFamilies: cluster.sources,
        corroborationBoost
      }
    };
  }

  function effectiveScore(decision, selected, sourceCounts, options = {}) {
    const source = sourceFamily(decision.sourceType);
    const sourceCount = sourceCounts.get(source) || 0;
    const repeatedSourcePenalty = sourceCount * Number(
      options.repeatedSourcePenalty ?? 7
    );

    const actionCount = selected.filter(
      (item) => item.action === decision.action
    ).length;
    const repeatedActionPenalty = actionCount * Number(
      options.repeatedActionPenalty ?? 4
    );

    const newSourceBonus = sourceCount === 0
      ? Number(options.newSourceBonus ?? 4)
      : 0;

    const criticalBonus = decision.priorityBand === 'critical' ? 8 : 0;

    return decision.score
      + newSourceBonus
      + criticalBonus
      - repeatedSourcePenalty
      - repeatedActionPenalty;
  }

  function arbitrate(decisions = [], options = {}) {
    const capacityMinutes = Number(options.capacityMinutes || 180);
    const maxItems = Number(options.maxItems || 3);
    const sourceLimits = {
      ...DEFAULT_SOURCE_LIMITS,
      ...(options.sourceLimits || {})
    };

    const rejected = [];
    const eligible = [];

    decisions.forEach((decision) => {
      if (!decision) {
        rejected.push({
          signalId: null,
          reason: 'invalid-decision'
        });
        return;
      }

      if (decision.classification?.isPromotion === true) {
        rejected.push({
          signalId: decision.signalId || decision.id,
          sourceType: decision.sourceType,
          reason: 'promotion-suppressed',
          score: decision.score
        });
        return;
      }

      if (decision.action === 'ignore') {
        rejected.push({
          signalId: decision.signalId || decision.id,
          sourceType: decision.sourceType,
          reason: 'ignored-by-policy',
          score: decision.score
        });
        return;
      }

      if (decision.priorityBand === 'low') {
        rejected.push({
          signalId: decision.signalId || decision.id,
          sourceType: decision.sourceType,
          reason: 'low-priority',
          score: decision.score
        });
        return;
      }

      eligible.push(decision);
    });

    const clusters = clusterDecisions(
      eligible,
      Number(options.clusterThreshold || 0.64)
    );

    const clustered = clusters.map((cluster) => {
      const enriched = applyCrossSourceEvidence(cluster);
      cluster.items
        .filter((item) => item.signalId !== enriched.signalId)
        .forEach((item) => {
          rejected.push({
            signalId: item.signalId || item.id,
            sourceType: item.sourceType,
            reason: 'merged-into-cross-source-cluster',
            mergedInto: enriched.signalId || enriched.id,
            clusterId: cluster.id,
            score: item.score
          });
        });
      return enriched;
    });

    const pool = [...clustered];
    const selected = [];
    const sourceCounts = new Map();
    let usedMinutes = 0;

    while (pool.length && selected.length < maxItems) {
      pool.sort((left, right) =>
        effectiveScore(right, selected, sourceCounts, options) -
        effectiveScore(left, selected, sourceCounts, options) ||
        right.confidence - left.confidence
      );

      const candidate = pool.shift();
      const source = sourceFamily(candidate.sourceType);
      const count = sourceCounts.get(source) || 0;
      const limit = Number(sourceLimits[source] ?? sourceLimits.generic ?? 1);
      const effort = Number(candidate.dimensions?.effortMinutes || 15);
      const candidateEffectiveScore = utils.round(
        effectiveScore(candidate, selected, sourceCounts, options)
      );

      if (count >= limit && candidate.priorityBand !== 'critical') {
        rejected.push({
          signalId: candidate.signalId || candidate.id,
          sourceType: candidate.sourceType,
          reason: 'source-limit',
          sourceFamily: source,
          sourceCount: count,
          sourceLimit: limit,
          score: candidate.score,
          effectiveScore: candidateEffectiveScore
        });
        continue;
      }

      if (usedMinutes + effort > capacityMinutes) {
        rejected.push({
          signalId: candidate.signalId || candidate.id,
          sourceType: candidate.sourceType,
          reason: 'capacity-exceeded',
          requiredMinutes: effort,
          usedMinutes,
          capacityMinutes,
          score: candidate.score,
          effectiveScore: candidateEffectiveScore
        });
        continue;
      }

      selected.push({
        ...candidate,
        arbitration: {
          ...candidate.arbitration,
          effectiveScore: candidateEffectiveScore,
          sourceFamily: source,
          selectionIndex: selected.length
        }
      });
      usedMinutes += effort;
      sourceCounts.set(source, count + 1);
    }

    pool.forEach((candidate) => {
      const source = sourceFamily(candidate.sourceType);
      rejected.push({
        signalId: candidate.signalId || candidate.id,
        sourceType: candidate.sourceType,
        reason: 'lower-effective-score',
        sourceFamily: source,
        score: candidate.score,
        effectiveScore: utils.round(
          effectiveScore(candidate, selected, sourceCounts, options)
        ),
        selectedCount: selected.length,
        maxItems
      });
    });

    const rejectionCounts = rejected.reduce((acc, item) => {
      acc[item.reason] = (acc[item.reason] || 0) + 1;
      return acc;
    }, {});

    return {
      items: selected,
      rejected,
      usedMinutes,
      capacityMinutes,
      remainingMinutes: Math.max(0, capacityMinutes - usedMinutes),
      audit: {
        inputDecisions: decisions.length,
        eligibleDecisions: eligible.length,
        topicClusters: clustered.length,
        selectedCount: selected.length,
        rejectedCount: rejected.length,
        rejectionCounts,
        selectedSources: Object.fromEntries(sourceCounts),
        sourceLimits,
        strategy: 'cross-source-corroboration-plus-diversity'
      }
    };
  }

  return {
    version: '7.2.0',
    DEFAULT_SOURCE_LIMITS,
    sourceFamily,
    clusterDecisions,
    applyCrossSourceEvidence,
    arbitrate
  };
});
