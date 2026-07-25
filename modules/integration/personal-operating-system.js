'use strict';

class PersonalOperatingSystem {
  constructor({ goalEngine, taskEngine, decisionEngine, attentionEngine, reviewEngine, planner }) {
    Object.assign(this, { goalEngine, taskEngine, decisionEngine, attentionEngine, reviewEngine, planner });
  }

  runDailyCycle({ date, goals = [], tasks = [], commitments = [], decisions = [], recommendations = [], completedGoalIds = [] }) {
    const goalEvaluations = goals.map(goal => this.goalEngine.evaluate(goal, { now: new Date(`${date}T23:59:59.999Z`), completedGoalIds }));
    const readyTasks = this.taskEngine.selectNext(tasks, { capacityMinutes: 480, now: new Date(`${date}T00:00:00.000Z`) });
    const dailyPlan = this.planner.build({
      date,
      commitments,
      tasks: readyTasks.map(task => ({ ...task, impact: task.priority, urgency: task.dueAt ? 1 : 0.5, confidence: 0.8 })),
      goals: goalEvaluations.map(item => ({ id: item.goalId, progress: item.progress, expectedProgress: item.status === 'at-risk' ? 1 : item.progress }))
    });
    const attention = this.attentionEngine.prioritize([
      ...goalEvaluations.filter(item => item.requiresReview).map(item => ({ id: `goal:${item.goalId}`, type: 'goal-risk', groupKey: 'goals', level: 'important', createdAt: date, payload: item })),
      ...dailyPlan.conflicts.map((pair, index) => ({ id: `conflict:${index}`, type: 'calendar-conflict', groupKey: 'calendar', level: 'urgent', createdAt: date, payload: pair }))
    ], { now: new Date(`${date}T12:00:00.000Z`) });
    const review = this.reviewEngine.build({ period: date, goals: goalEvaluations, tasks, decisions, recommendations });
    return { date, goalEvaluations, readyTasks, dailyPlan, attention, review, requiresApproval: true };
  }
}

module.exports = { PersonalOperatingSystem };
