export function updateDecisionPreferences(preferences = {}, feedback = {}) {
  const next = structuredClone(preferences || {});
  next.optionAffinity = { ...(next.optionAffinity || {}) };
  next.history = [...(next.history || [])];

  const delta = feedback.accepted ? 1 : -1;
  if (feedback.optionId) {
    next.optionAffinity[feedback.optionId] = Math.max(
      -5,
      Math.min(5, (next.optionAffinity[feedback.optionId] || 0) + delta)
    );
  }

  next.history.push({
    at: new Date().toISOString(),
    optionId: feedback.optionId || null,
    accepted: Boolean(feedback.accepted),
    reason: feedback.reason || null,
  });

  return next;
}

export function applyPreferenceBias(score, optionId, preferences = {}) {
  const affinity = preferences.optionAffinity?.[optionId] || 0;
  return Math.max(0, Math.min(100, score + affinity * 2));
}
