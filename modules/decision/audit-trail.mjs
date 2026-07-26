export function createDecisionAudit({
  context,
  rankedOptions,
  recommendation,
  approval = null,
} = {}) {
  return {
    id: `decision_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    contextSnapshot: context,
    rankedOptions: rankedOptions.map(item => ({
      optionId: item.option.id,
      score: item.tradeoff.score,
      safe: item.safety.safe,
      approvalRequired: item.safety.approvalRequired,
    })),
    recommendation: recommendation?.option?.id || null,
    approval,
    immutableFields: ['createdAt', 'contextSnapshot', 'rankedOptions'],
  };
}
