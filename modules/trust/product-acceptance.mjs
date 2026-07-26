export function validateTrustCenter({ report, exportPayload, deletionPlan } = {}) {
  const failures = [];
  if (!report?.generatedAt) failures.push('privacy report missing');
  if (exportPayload?.schema !== 'sigma-user-export-v1') failures.push('export schema missing');
  if (!deletionPlan?.requiresConfirmation) failures.push('deletion confirmation missing');
  if (!Array.isArray(deletionPlan?.steps)) failures.push('deletion steps missing');
  return { ok: failures.length === 0, failures };
}
