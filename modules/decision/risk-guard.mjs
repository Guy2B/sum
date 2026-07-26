const SENSITIVE_KINDS = new Set(['pay', 'send', 'sign', 'delete', 'publish', 'transfer', 'submit']);

export function assessDecisionSafety(option, context = {}) {
  const kind = String(context.action?.kind || '').toLowerCase();
  const sensitive = SENSITIVE_KINDS.has(kind);
  const irreversible = option.reversible === false;
  const highCost = Number(option.cost || 0) > Number(context.constraints?.budget || Infinity);
  const lowConfidence = Number(context.signal?.priority?.confidence || context.action?.confidence || 1) < 0.6;

  const blockers = [];
  if (sensitive && option.id === 'do-now') blockers.push('Validation humaine requise pour une action sensible.');
  if (highCost) blockers.push('Le coût dépasse le budget déclaré.');
  if (irreversible && lowConfidence) blockers.push('Décision irréversible avec une confiance insuffisante.');

  return {
    safe: blockers.length === 0,
    approvalRequired: sensitive || irreversible || Boolean(context.constraints?.approvalRequired),
    blockers,
    warnings: lowConfidence ? ['La confiance disponible est limitée.'] : [],
  };
}
