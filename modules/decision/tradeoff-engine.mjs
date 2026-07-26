export function scoreTradeoff(option, outcome, context = {}) {
  const tolerance = context.profile?.riskTolerance || 'balanced';
  const riskWeight = tolerance === 'low' ? 0.5 : tolerance === 'high' ? 0.25 : 0.38;
  const benefitWeight = tolerance === 'low' ? 0.32 : tolerance === 'high' ? 0.5 : 0.42;
  const effortWeight = 0.12;
  const costWeight = 0.08;

  const effortPenalty = Math.min(1, (outcome.effortMinutes || 0) / 180);
  const budget = context.constraints?.budget;
  const costPenalty = budget && budget > 0
    ? Math.min(1, (outcome.cost || 0) / budget)
    : Math.min(1, (outcome.cost || 0) / 1000);

  let score = (
    outcome.benefit * benefitWeight
    - outcome.risk * riskWeight
    - effortPenalty * effortWeight
    - costPenalty * costWeight
  ) * 100;

  if (option.id === 'ignore' && ['critical', 'high'].includes(context.action?.priorityLevel)) score -= 30;
  if (option.requiresDelegate && !(context.profile?.delegates || []).length) score -= 15;

  return {
    optionId: option.id,
    score: Math.max(0, Math.min(100, Math.round(score + 50))),
    components: {
      benefit: Math.round(outcome.benefit * 100),
      risk: Math.round(outcome.risk * 100),
      effortPenalty: Math.round(effortPenalty * 100),
      costPenalty: Math.round(costPenalty * 100),
    },
  };
}
