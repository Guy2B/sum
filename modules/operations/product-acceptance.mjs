export function validateOperationsEngine(result = {}) {
  const failures = [];
  if (!result.health) failures.push('health missing');
  if (!result.readiness) failures.push('readiness missing');
  if (!result.metrics) failures.push('metrics missing');
  return { ok: failures.length === 0, failures };
}
