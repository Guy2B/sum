export function createReview({ workspaceId, period, goals = [], tasks = [], decisions = [] }) {
  const completed = tasks.filter((t) => t.status === 'done');
  const open = tasks.filter((t) => !['done','cancelled'].includes(t.status));
  return {
    id: `${workspaceId}:${period}`,
    workspaceId,
    period,
    metrics: { completedTasks: completed.length, openTasks: open.length, completedGoals: goals.filter((g) => g.status === 'completed').length },
    highlights: completed.slice(0, 5).map((t) => t.title),
    risks: goals.filter((g) => g.status === 'active' && (g.progress ?? 0) < 25).map((g) => ({ goalId: g.id, reason: 'low-progress' })),
    decisionsToRevisit: decisions.filter((d) => d.reviewAt && new Date(d.reviewAt) <= new Date()).map((d) => d.id)
  };
}
