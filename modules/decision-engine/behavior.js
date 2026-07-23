'use strict';

(function initBehavior(root, factory) {
  const utils = typeof module === 'object' && module.exports
    ? require('./utils')
    : root.SIGMA_DECISION_UTILS;
  const api = factory(utils);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_DECISION_BEHAVIOR = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(utils) {
  const MIN_OBSERVATIONS = 5;
  const MAX_BEHAVIOR_ADJUSTMENT = 12;

  function normalizeObservation(entry) {
    return {
      action: entry.action || entry.outcome || '',
      sourceType: entry.sourceType || entry.signal?.sourceType || '',
      intent: entry.intent || entry.signal?.intent || '',
      category: entry.category || entry.signal?.category || '',
      relationshipType:
        entry.relationshipType || entry.signal?.relationshipType || '',
      hour: Number.isFinite(Number(entry.hour))
        ? Number(entry.hour)
        : utils.toDate(entry.createdAt)?.getHours(),
      delayHours: Number(entry.delayHours || entry.responseDelayHours || 0),
      accepted: entry.accepted === true || entry.action === 'accepted',
      rejected: entry.rejected === true || entry.action === 'rejected',
      deferred: entry.deferred === true || entry.action === 'deferred',
      completed: entry.completed === true || entry.action === 'completed'
    };
  }

  function matches(signal, observation) {
    const checks = [
      ['sourceType', signal.sourceType],
      ['intent', signal.intent],
      ['category', signal.category],
      ['relationshipType', signal.relationshipType]
    ];
    const meaningful = checks.filter(([, value]) => value);
    if (!meaningful.length) return true;
    return meaningful.every(([key, value]) => {
      const observed = observation[key];
      return !observed || observed === value;
    });
  }

  function learnProfile(observations = []) {
    const rows = observations.map(normalizeObservation);
    const actionable = rows.filter(
      (row) => row.accepted || row.rejected || row.deferred || row.completed
    );

    if (actionable.length < MIN_OBSERVATIONS) {
      return {
        ready: false,
        observationCount: actionable.length,
        confidence: actionable.length / MIN_OBSERVATIONS,
        patterns: []
      };
    }

    const hourCounts = new Map();
    actionable
      .filter((row) => Number.isFinite(row.hour) && (row.accepted || row.completed))
      .forEach((row) => hourCounts.set(row.hour, (hourCounts.get(row.hour) || 0) + 1));

    const preferredHour = [...hourCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const patterns = [];
    const dimensions = ['sourceType', 'intent', 'category', 'relationshipType'];

    dimensions.forEach((dimension) => {
      const groups = new Map();
      actionable.forEach((row) => {
        const key = row[dimension];
        if (!key) return;
        const group = groups.get(key) || { total: 0, accepted: 0, rejected: 0, deferred: 0 };
        group.total += 1;
        group.accepted += row.accepted || row.completed ? 1 : 0;
        group.rejected += row.rejected ? 1 : 0;
        group.deferred += row.deferred ? 1 : 0;
        groups.set(key, group);
      });

      groups.forEach((group, value) => {
        if (group.total < MIN_OBSERVATIONS) return;
        patterns.push({
          dimension,
          value,
          observations: group.total,
          acceptanceRate: group.accepted / group.total,
          rejectionRate: group.rejected / group.total,
          deferralRate: group.deferred / group.total,
          confidence: utils.clamp(group.total / 20, 0, 1)
        });
      });
    });

    return {
      ready: true,
      observationCount: actionable.length,
      confidence: utils.clamp(actionable.length / 30, 0.2, 1),
      preferredHour,
      patterns
    };
  }

  function behaviorAdjustment(signal, profile, now = new Date()) {
    if (!profile?.ready) {
      return {
        adjustment: 0,
        confidence: profile?.confidence || 0,
        reasons: ['Not enough observed decisions to personalize safely']
      };
    }

    let adjustment = 0;
    const reasons = [];

    profile.patterns.forEach((pattern) => {
      if (signal[pattern.dimension] !== pattern.value) return;
      const strength = pattern.confidence;
      const delta = (pattern.acceptanceRate - pattern.rejectionRate) * 8 * strength;
      adjustment += delta;
      if (Math.abs(delta) >= 1.5) {
        reasons.push(
          delta > 0
            ? `You usually act on ${pattern.value} items`
            : `You often reject ${pattern.value} items`
        );
      }
    });

    if (profile.preferredHour !== null) {
      const distance = Math.min(
        Math.abs(now.getHours() - profile.preferredHour),
        24 - Math.abs(now.getHours() - profile.preferredHour)
      );
      if (distance <= 1) {
        adjustment += 2 * profile.confidence;
        reasons.push('This matches your observed action time');
      }
    }

    return {
      adjustment: utils.clamp(
        adjustment,
        -MAX_BEHAVIOR_ADJUSTMENT,
        MAX_BEHAVIOR_ADJUSTMENT
      ),
      confidence: profile.confidence,
      reasons
    };
  }

  return {
    MIN_OBSERVATIONS,
    MAX_BEHAVIOR_ADJUSTMENT,
    learnProfile,
    behaviorAdjustment,
    matches
  };
});
