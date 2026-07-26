export function validateConnectorRuntime({ installation, syncResult } = {}) {
  const failures = [];
  if (!installation?.definition?.id) failures.push('connector definition missing');
  if (!installation?.grant?.granted?.includes('read-signals')) failures.push('read permission missing');
  if (syncResult?.status !== 'success') failures.push('sync did not succeed');
  if (!syncResult?.imported?.queue?.groups) failures.push('attention queue missing');
  if (!syncResult?.health?.status) failures.push('health status missing');
  return { ok: failures.length === 0, failures };
}
