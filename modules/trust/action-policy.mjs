const RISK = {
  review: 'low',
  schedule: 'low',
  reply: 'medium',
  send: 'high',
  pay: 'high',
  transfer: 'critical',
  delete: 'critical',
  sign: 'critical',
  publish: 'high',
};

export function evaluateActionPolicy(action = {}, context = {}) {
  const risk = RISK[String(action.kind || 'review').toLowerCase()] || 'medium';
  const trusted = Boolean(context.trustedSubjects?.includes(action.subject));
  const approved = Boolean(context.approvals?.includes(action.id));

  const approvalRequired = ['high', 'critical'].includes(risk) || !trusted;
  const allowed = !approvalRequired || approved;
  return {
    actionId: action.id || null,
    risk,
    approvalRequired,
    allowed,
    reason: allowed
      ? 'La politique autorise cette action.'
      : 'Une validation humaine explicite est requise.',
  };
}
