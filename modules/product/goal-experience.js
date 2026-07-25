export function createGoal(input, now = new Date()) {
  const title = String(input?.title ?? '').trim();
  if (!title) throw new Error('Goal title is required');
  return { id: input.id ?? `goal-${crypto.randomUUID()}`, title, targetDate: input.targetDate ?? '', status:'active', progress:0, createdAt:now.toISOString() };
}
export function updateGoalProgress(goal, progress) {
  const value = Math.max(0, Math.min(100, Number(progress) || 0));
  return { ...goal, progress:value, status:value === 100 ? 'completed' : goal.status === 'completed' ? 'active' : goal.status };
}
