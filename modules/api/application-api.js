const required = (value, name) => { if (!value) throw new Error(`${name} is required`); return value; };
const id = (prefix) => `${prefix}-${crypto.randomUUID()}`;

export class ApplicationApi {
  constructor({ store }) { this.store = required(store, 'store'); }

  createGoal(input, actor) {
    required(actor?.workspaceId, 'actor.workspaceId');
    return this.store.save('goals', { id: input.id ?? id('goal'), workspaceId: actor.workspaceId, ownerId: actor.userId, title: required(input.title, 'title'), targetDate: input.targetDate ?? null, progress: 0, status: 'active', milestones: input.milestones ?? [] });
  }
  updateGoal(goalId, changes, actor) { return this.#updateOwned('goals', goalId, changes, actor); }
  createTask(input, actor) {
    required(actor?.workspaceId, 'actor.workspaceId');
    return this.store.save('tasks', { id: input.id ?? id('task'), workspaceId: actor.workspaceId, ownerId: actor.userId, title: required(input.title, 'title'), goalId: input.goalId ?? null, dueAt: input.dueAt ?? null, priority: input.priority ?? 50, status: 'open', blockedBy: input.blockedBy ?? [] });
  }
  updateTask(taskId, changes, actor) { return this.#updateOwned('tasks', taskId, changes, actor); }
  list(resource, actor) { return this.store.list(resource, (r) => r.workspaceId === actor.workspaceId); }

  #updateOwned(resource, recordId, changes, actor) {
    const current = this.store.get(resource, recordId);
    if (!current || current.workspaceId !== actor.workspaceId) throw new Error('record not found');
    return this.store.save(resource, { ...current, ...changes, id: recordId, workspaceId: current.workspaceId });
  }
}
