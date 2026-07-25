'use strict';

const TERMINAL = new Set(['achieved', 'cancelled']);

function number(value, fallback = 0) {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

class GoalOutcomeEngine {
  createGoal(input) {
    if (!input?.id || !input?.title || !input?.workspaceId) {
      throw new Error('Goal id, title and workspaceId are required');
    }
    const milestones = (input.milestones || []).map((milestone, index) => ({
      id: milestone.id || `${input.id}:milestone:${index + 1}`,
      title: milestone.title || `Milestone ${index + 1}`,
      weight: Math.max(0, number(milestone.weight, 1)),
      progress: Math.min(1, Math.max(0, number(milestone.progress))),
      dueAt: milestone.dueAt || null,
      status: milestone.status || 'active'
    }));
    return Object.freeze({
      id: input.id,
      type: 'goal',
      title: input.title,
      workspaceId: input.workspaceId,
      ownerId: input.ownerId || null,
      outcome: input.outcome || null,
      status: input.status || 'active',
      priority: Math.min(1, Math.max(0, number(input.priority, 0.5))),
      targetAt: input.targetAt || null,
      dependencies: [...new Set(input.dependencies || [])],
      indicators: (input.indicators || []).map(indicator => ({ ...indicator })),
      milestones,
      evidence: [...(input.evidence || [])]
    });
  }

  progress(goal) {
    if (TERMINAL.has(goal.status)) return goal.status === 'achieved' ? 1 : 0;
    if (!goal.milestones?.length) return 0;
    const totalWeight = goal.milestones.reduce((sum, item) => sum + item.weight, 0) || 1;
    return goal.milestones.reduce((sum, item) => sum + item.progress * item.weight, 0) / totalWeight;
  }

  evaluate(goal, { now = new Date(), completedGoalIds = [] } = {}) {
    const progress = this.progress(goal);
    const blockedBy = goal.dependencies.filter(id => !completedGoalIds.includes(id));
    const overdue = Boolean(goal.targetAt && new Date(goal.targetAt) < new Date(now) && progress < 1);
    return {
      goalId: goal.id,
      progress,
      blockedBy,
      status: blockedBy.length ? 'blocked' : overdue ? 'at-risk' : progress >= 1 ? 'achieved' : goal.status,
      requiresReview: blockedBy.length > 0 || overdue,
      explanation: blockedBy.length ? `Blocked by ${blockedBy.join(', ')}` : overdue ? 'Target date passed before completion' : 'Goal is progressing normally'
    };
  }
}

module.exports = { GoalOutcomeEngine };
