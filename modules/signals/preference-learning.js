export function learnPreference(store = {}, feedback = {}) {
  if (!feedback.key) throw new Error('Preference key is required');
  return {
    ...store,
    [feedback.key]: {
      value: feedback.value,
      reason: feedback.reason ?? null,
      updatedAt: new Date().toISOString(),
      reversible: true
    }
  };
}
export function removePreference(store = {}, key) {
  const next = { ...store };
  delete next[key];
  return next;
}
