export function resolveEditionAction(signal, registry) {
  const profile = registry.get(signal.editionId);
  const template = profile?.actionTemplates?.[signal.domain];
  return {
    title: template ?? `Examiner : ${signal.title ?? 'signal'}`,
    domain: signal.domain ?? 'general',
    sourceSignalId: signal.id,
    priority: signal.priorityLevel ?? 'medium',
    dueAt: signal.dueAt ?? null,
    requiresApproval: ['payment', 'legal', 'medical'].includes(signal.actionType),
    explanation: (signal.priorityReasons ?? []).join(', ')
  };
}
