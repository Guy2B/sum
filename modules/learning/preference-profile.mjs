export function createPreferenceProfile(input = {}) {
  return {
    optionAffinity: { ...(input.optionAffinity || {}) },
    sourceTrust: { ...(input.sourceTrust || {}) },
    quietHours: input.quietHours || null,
    preferredPlanningStyle: input.preferredPlanningStyle || 'balanced',
    explanationDepth: input.explanationDepth || 'standard',
    updatedAt: new Date().toISOString(),
  };
}

export function updateAffinity(profile, key, delta) {
  const next = createPreferenceProfile(profile);
  next.optionAffinity[key] = Math.max(-10, Math.min(10, (next.optionAffinity[key] || 0) + delta));
  return next;
}
