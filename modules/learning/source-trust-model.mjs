export function updateSourceTrust(profile, { source, correct }) {
  const next = structuredClone(profile || {});
  next.sourceTrust = { ...(next.sourceTrust || {}) };
  const current = next.sourceTrust[source] ?? 0.5;
  const delta = correct ? 0.05 : -0.08;
  next.sourceTrust[source] = Math.max(0, Math.min(1, Number((current + delta).toFixed(2))));
  return next;
}
