export function validateStandardConnectorPack({ installations = [], orchestration } = {}) {
  const failures = [];
  if (installations.length < 3) failures.push('fewer than three connector types installed');
  if (!orchestration) failures.push('orchestration result missing');
  if ((orchestration?.failed || 0) > 0) failures.push('one or more connector syncs failed');
  if ((orchestration?.imported || 0) < 1) failures.push('no signals imported');
  return { ok: failures.length === 0, failures };
}
