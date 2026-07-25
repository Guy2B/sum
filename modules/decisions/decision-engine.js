'use strict';

class DecisionEngine {
  evaluate(input) {
    if (!input?.id || !input?.workspaceId || !Array.isArray(input.options) || input.options.length < 2) {
      throw new Error('Decision requires id, workspaceId and at least two options');
    }
    const criteria = input.criteria?.length ? input.criteria : [{ id: 'value', weight: 1 }];
    const scored = input.options.map(option => {
      const score = criteria.reduce((sum, criterion) => {
        const rating = Number(option.ratings?.[criterion.id] ?? 0);
        return sum + rating * Number(criterion.weight ?? 1);
      }, 0);
      const riskPenalty = (option.risks || []).reduce((sum, risk) => sum + Number(risk.probability ?? 0) * Number(risk.impact ?? 0), 0);
      const evidenceConfidence = option.evidence?.length
        ? option.evidence.reduce((sum, item) => sum + Number(item.confidence ?? 0.5), 0) / option.evidence.length
        : 0;
      return { ...option, score: score - riskPenalty, riskPenalty, evidenceConfidence };
    }).sort((a, b) => b.score - a.score || b.evidenceConfidence - a.evidenceConfidence || String(a.id).localeCompare(String(b.id)));
    const winner = scored[0];
    return {
      decisionId: input.id,
      rankedOptions: scored,
      recommendation: winner.id,
      confidence: Math.min(1, Math.max(0, winner.evidenceConfidence)),
      requiresApproval: true,
      explanation: `${winner.id} has the highest evidence-adjusted score (${winner.score.toFixed(2)})`
    };
  }

  recordOutcome(decision, outcome) {
    return {
      ...decision,
      outcome: {
        selectedOptionId: outcome.selectedOptionId,
        result: outcome.result,
        observedAt: outcome.observedAt || new Date().toISOString(),
        lessons: [...(outcome.lessons || [])]
      }
    };
  }
}

module.exports = { DecisionEngine };
