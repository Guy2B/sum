import { buildDashboard } from '../dashboard/dashboard-projection.js';
export function createConsoleModel({ api, actor, recommendations = [] }) {
  const refresh = () => buildDashboard({ goals: api.list('goals', actor), tasks: api.list('tasks', actor), recommendations });
  return {
    refresh,
    addGoal: (title, targetDate = null) => { api.createGoal({ title, targetDate }, actor); return refresh(); },
    addTask: (title, goalId = null, dueAt = null) => { api.createTask({ title, goalId, dueAt }, actor); return refresh(); },
    completeTask: (taskId) => { api.updateTask(taskId, { status: 'done' }, actor); return refresh(); }
  };
}
