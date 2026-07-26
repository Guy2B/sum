export function buildDeletionPlan({
  userId,
  connectors = [],
  retainedItems = [],
  preserveAudit = true,
} = {}) {
  if (!userId) throw new Error('userId is required');
  return {
    userId,
    steps: [
      { kind: 'disable-connectors', count: connectors.length },
      { kind: 'revoke-consents' },
      { kind: 'delete-retained-items', count: retainedItems.filter(item => !(preserveAudit && item.type === 'audit')).length },
      { kind: 'preserve-audit', enabled: preserveAudit },
      { kind: 'confirm-completion' },
    ],
    requiresConfirmation: true,
    createdAt: new Date().toISOString(),
  };
}
