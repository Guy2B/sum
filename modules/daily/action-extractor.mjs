import { estimateAction } from './action-estimator.mjs';

export function extractActionsFromAttentionQueue(queue = {}) {
  const levels = ['critical', 'high', 'today', 'week'];
  const actions = [];

  for (const level of levels) {
    for (const signal of queue.groups?.[level] || []) {
      const proposed = signal.proposedAction || { kind: 'review', title: `Examiner : ${signal.title}` };
      actions.push(estimateAction({
        id: `action_${signal.id}`,
        signalId: signal.id,
        title: proposed.title,
        kind: proposed.kind,
        priorityLevel: level,
        priorityScore: signal.priority?.score || 0,
        deadline: signal.deadline || null,
        confidence: signal.priority?.confidence || 0,
        reason: signal.explanation?.summary || '',
        source: signal.source || 'unknown',
        domain: signal.domain || null,
      }));
    }
  }

  return actions;
}
