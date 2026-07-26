export function validateLearningEngine(result = {}) {
  const failures = [];
  if (!result.profile) failures.push('profile missing');
  if (!result.patterns) failures.push('patterns missing');
  if (!result.calibration) failures.push('calibration missing');
  if (!result.recommendedTimeWindow) failures.push('timing recommendation missing');
  if (!Array.isArray(result.routines)) failures.push('routines missing');
  return { ok: failures.length === 0, failures };
}
