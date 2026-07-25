export function createTask(input, now = new Date()) {
  const title = String(input?.title ?? '').trim();
  if (!title) throw new Error('Task title is required');
  return { id: input.id ?? `task-${crypto.randomUUID()}`, title, dueAt:input.dueAt ?? '', priority:input.priority ?? 'medium', goalId:input.goalId ?? '', status:'open', createdAt:now.toISOString() };
}
export function moveTask(task, status) {
  if (!['open','in_progress','done'].includes(status)) throw new Error('Unsupported task status');
  return { ...task, status, completedAt:status === 'done' ? new Date().toISOString() : null };
}
