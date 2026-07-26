export function buildDecisionContext({
  signal = null,
  action = null,
  profile = {},
  constraints = {},
  alternatives = [],
  history = [],
} = {}) {
  return {
    signal,
    action,
    profile: {
      editions: profile.editions || ['personal'],
      goals: profile.goals || [],
      values: profile.values || [],
      riskTolerance: profile.riskTolerance || 'balanced',
    },
    constraints: {
      budget: constraints.budget ?? null,
      availableMinutes: constraints.availableMinutes ?? null,
      deadline: constraints.deadline ?? signal?.deadline ?? action?.deadline ?? null,
      approvalRequired: constraints.approvalRequired ?? false,
    },
    alternatives,
    history,
    createdAt: new Date().toISOString(),
  };
}
