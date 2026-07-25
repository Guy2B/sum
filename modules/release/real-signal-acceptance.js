export function realSignalAcceptance(result = {}) {
  const required = ['signal','explanation','action','edition'];
  const missing = required.filter(key => !result[key]);
  const unsafe = result.action?.requiresApproval === false && ['send','pay','sign','delete','publish'].includes(result.action?.type);
  return { ok: missing.length === 0 && !unsafe, missing, unsafe };
}
