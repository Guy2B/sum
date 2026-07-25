export function projectEditionSignalInbox(items) {
  const rank = { critical: 4, high: 3, medium: 2, low: 1 };
  return [...items]
    .sort((a, b) => (rank[b.signal.priorityLevel] ?? 0) - (rank[a.signal.priorityLevel] ?? 0) ||
      String(a.signal.dueAt ?? '9999').localeCompare(String(b.signal.dueAt ?? '9999')))
    .map(item => ({
      id: item.signal.id,
      title: item.signal.title,
      edition: item.signal.editionId,
      domain: item.signal.domain,
      priority: item.signal.priorityLevel,
      score: item.signal.priorityScore,
      action: item.action.title,
      reason: item.action.explanation
    }));
}
