export function buildDashboard({ goals = [], tasks = [], recommendations = [], now = new Date() }) {
  const dueSoon = tasks.filter((t) => t.status !== 'done' && t.dueAt && new Date(t.dueAt) <= new Date(now.getTime() + 86400000));
  const blocked = tasks.filter((t) => t.status !== 'done' && (t.blockedBy?.length ?? 0) > 0);
  const activeGoals = goals.filter((g) => g.status === 'active');
  const atRiskGoals = activeGoals.filter((g) => g.targetDate && new Date(g.targetDate) < now && Number(g.progress ?? 0) < 100);
  return {
    generatedAt: now.toISOString(),
    counters: { activeGoals: activeGoals.length, openTasks: tasks.filter((t) => t.status !== 'done').length, dueSoon: dueSoon.length, blocked: blocked.length, atRiskGoals: atRiskGoals.length },
    priorities: [...dueSoon, ...tasks.filter((t) => t.status !== 'done' && !dueSoon.includes(t))].sort((a,b) => (b.priority ?? 0) - (a.priority ?? 0)).slice(0, 5),
    recommendations: [...recommendations].sort((a,b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 3),
    atRiskGoals
  };
}
