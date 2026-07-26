export function validateDecisionEngine(result = {}) {
  const failures = [];
  if (!result.context) failures.push('context missing');
  if (!Array.isArray(result.ranked) || result.ranked.length < 2) failures.push('ranked options missing');
  if (!result.recommendation?.option) failures.push('recommendation missing');
  if (!result.explanation?.summary) failures.push('explanation missing');
  if (!Array.isArray(result.counterfactuals)) failures.push('counterfactuals missing');
  if (!result.audit?.id) failures.push('audit trail missing');
  const unsafeRecommended = result.recommendation && !result.recommendation.safety.safe;
  if (unsafeRecommended) failures.push('unsafe option recommended');
  return { ok: failures.length === 0, failures };
}
