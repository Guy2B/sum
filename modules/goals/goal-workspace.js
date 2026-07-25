export class GoalWorkspace {
  constructor({ api, actor }) { this.api = api; this.actor = actor; }
  create(input) { return this.api.createGoal(input, this.actor); }
  addMilestone(goalId, milestone) {
    const goal = this.api.list('goals', this.actor).find((g) => g.id === goalId);
    if (!goal) throw new Error('goal not found');
    return this.api.updateGoal(goalId, { milestones: [...goal.milestones, { id: milestone.id ?? crypto.randomUUID(), title: milestone.title, completed: false }] }, this.actor);
  }
  completeMilestone(goalId, milestoneId) {
    const goal = this.api.list('goals', this.actor).find((g) => g.id === goalId);
    const milestones = goal.milestones.map((m) => m.id === milestoneId ? { ...m, completed: true } : m);
    const progress = milestones.length ? Math.round(milestones.filter((m) => m.completed).length / milestones.length * 100) : goal.progress;
    return this.api.updateGoal(goalId, { milestones, progress, status: progress === 100 ? 'completed' : goal.status }, this.actor);
  }
}
