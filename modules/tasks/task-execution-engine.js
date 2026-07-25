'use strict';

const ALLOWED = {
  backlog: ['ready', 'cancelled'],
  ready: ['in-progress', 'blocked', 'cancelled'],
  'in-progress': ['done', 'blocked', 'cancelled'],
  blocked: ['ready', 'in-progress', 'cancelled'],
  done: [],
  cancelled: []
};

class TaskExecutionEngine {
  createTask(input) {
    if (!input?.id || !input?.title || !input?.workspaceId) throw new Error('Task id, title and workspaceId are required');
    return {
      id: input.id,
      type: 'task',
      title: input.title,
      workspaceId: input.workspaceId,
      goalId: input.goalId || null,
      assigneeId: input.assigneeId || null,
      status: input.status || 'backlog',
      priority: Math.min(1, Math.max(0, Number(input.priority ?? 0.5))),
      estimateMinutes: Math.max(0, Number(input.estimateMinutes ?? 0)),
      dueAt: input.dueAt || null,
      dependencies: [...new Set(input.dependencies || [])],
      requiresApproval: input.requiresApproval !== false,
      history: []
    };
  }

  transition(task, nextStatus, { actorId, reason = null, now = new Date().toISOString(), completedTaskIds = [] } = {}) {
    if (!ALLOWED[task.status]?.includes(nextStatus)) throw new Error(`Invalid task transition: ${task.status} -> ${nextStatus}`);
    const unresolved = task.dependencies.filter(id => !completedTaskIds.includes(id));
    if (nextStatus === 'in-progress' && unresolved.length) throw new Error(`Task dependencies unresolved: ${unresolved.join(', ')}`);
    return {
      ...task,
      status: nextStatus,
      history: [...task.history, { from: task.status, to: nextStatus, actorId: actorId || null, reason, at: now }]
    };
  }

  selectNext(tasks, { capacityMinutes = Infinity, completedTaskIds = [], now = new Date() } = {}) {
    let used = 0;
    return tasks
      .filter(task => ['backlog', 'ready'].includes(task.status))
      .filter(task => task.dependencies.every(id => completedTaskIds.includes(id)))
      .sort((a, b) => {
        const aOverdue = a.dueAt && new Date(a.dueAt) < now ? 1 : 0;
        const bOverdue = b.dueAt && new Date(b.dueAt) < now ? 1 : 0;
        return bOverdue - aOverdue || b.priority - a.priority || String(a.id).localeCompare(String(b.id));
      })
      .filter(task => {
        if (used + task.estimateMinutes > capacityMinutes) return false;
        used += task.estimateMinutes;
        return true;
      });
  }
}

module.exports = { TaskExecutionEngine };
