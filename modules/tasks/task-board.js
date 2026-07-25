export class TaskBoard {
  constructor({ api, actor }) { this.api = api; this.actor = actor; }
  create(input) { return this.api.createTask(input, this.actor); }
  move(taskId, status) {
    if (!['open','in_progress','done','cancelled'].includes(status)) throw new Error('unsupported task status');
    return this.api.updateTask(taskId, { status, completedAt: status === 'done' ? new Date().toISOString() : null }, this.actor);
  }
  columns() {
    const tasks = this.api.list('tasks', this.actor);
    return Object.fromEntries(['open','in_progress','done','cancelled'].map((status) => [status, tasks.filter((task) => task.status === status)]));
  }
}
