export function validateDailyAssistant(result = {}) {
  const failures = [];
  if (!Array.isArray(result.actions)) failures.push('actions missing');
  if (!Array.isArray(result.windows)) failures.push('time windows missing');
  if (!result.plan?.capacity) failures.push('capacity missing');
  if (!Array.isArray(result.plan?.focus)) failures.push('focus missing');
  if (!result.mentalLoad?.level) failures.push('mental load missing');
  if (!result.brief?.title) failures.push('daily brief missing');
  if ((result.plan?.focus || []).length > 3) failures.push('too many focus items');
  if ((result.plan?.usedMinutes || 0) > (result.plan?.capacity?.usableMinutes || 0)) failures.push('capacity exceeded');
  return { ok: failures.length === 0, failures };
}
