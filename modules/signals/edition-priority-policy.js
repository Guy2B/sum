const clamp = value => Math.max(0, Math.min(100, value));

export function applyEditionPriority(signal, route, registry) {
  const profile = registry.get(route.editionId);
  if (!profile) throw new Error(`Unknown edition: ${route.editionId}`);
  const base = Number(signal.priorityScore ?? 0);
  const domainBoost = Number(profile.priorityBoosts[signal.domain] ?? 0);
  const score = clamp(base + domainBoost + Math.min(route.score, 35));
  const level = score >= 85 ? 'critical' : score >= 65 ? 'high' : score >= 40 ? 'medium' : 'low';
  return { ...signal, editionId: profile.id, priorityScore: score, priorityLevel: level,
    priorityReasons: [...(signal.priorityReasons ?? []), `edition:${profile.id}`, ...(route.criticalHit ? [`critical-pattern:${route.criticalHit}`] : [])] };
}
