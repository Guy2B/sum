'use strict';

(function initExplain(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_DECISION_EXPLAIN = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory() {
  function dimensionReasons(facts) {
    const reasons = [];
    if (facts.importance >= 70) reasons.push(`High importance (${facts.importance}/100)`);
    if (facts.urgency >= 70) reasons.push(`Time-sensitive (${facts.urgency}/100)`);
    if (facts.impact >= 70) reasons.push(`High expected impact (${facts.impact}/100)`);
    if (facts.costOfInaction >= 70) reasons.push('Waiting may create a meaningful cost');
    if (facts.effortMinutes <= 10 && facts.impact >= 55) {
      reasons.push(`Estimated effort is only ${facts.effortMinutes} minutes`);
    }
    if (facts.relationshipValue >= 0.75) reasons.push('Important verified relationship');
    if (facts.goalAlignment >= 0.55) reasons.push('Aligned with a declared goal');
    if (facts.isPromotion) reasons.push('Detected as promotional content');
    return reasons;
  }

  function buildExplanation(facts, ruleResult, behaviorResult, scored) {
    const ruleReasons = (ruleResult?.fired || []).map((entry) => entry.reason);
    const behaviorReasons = behaviorResult?.reasons || [];
    const reasons = [...new Set([
      ...ruleReasons,
      ...dimensionReasons(facts),
      ...behaviorReasons
    ])].slice(0, 6);

    const uncertainties = [];
    if (facts.confidence < 65) uncertainties.push('Some source or context data is incomplete');
    if (facts.relationshipType === 'unknown') uncertainties.push('Relationship type is not verified');
    if (!facts.dueAt && facts.urgency >= 60) uncertainties.push('Urgency is inferred without a formal deadline');
    if (behaviorResult?.confidence < 0.5) uncertainties.push('Personalization confidence is still limited');

    return {
      summary:
        scored.band === 'critical'
          ? 'Act now'
          : scored.band === 'high'
            ? 'Handle today'
            : scored.band === 'medium'
              ? 'Review when capacity allows'
              : 'Low priority',
      reasons,
      uncertainties,
      evidence: {
        sourceType: facts.sourceType,
        relationshipType: facts.relationshipType,
        intent: facts.intent,
        confidence: facts.confidence
      }
    };
  }

  return { buildExplanation };
});
