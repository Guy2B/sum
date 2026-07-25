'use strict';

class ReviewReflectionEngine {
  build({ period, goals = [], tasks = [], decisions = [], recommendations = [], now = new Date().toISOString() }) {
    const completed = tasks.filter(task => task.status === 'done');
    const blocked = tasks.filter(task => task.status === 'blocked');
    const goalsAtRisk = goals.filter(goal => ['at-risk', 'blocked'].includes(goal.status));
    const decisionsToRevisit = decisions.filter(decision => decision.outcome && decision.outcome.result === 'worse-than-expected');
    const ignoredRecommendations = recommendations.filter(item => item.status === 'ignored' && Number(item.confidence ?? 0) >= 0.7);
    return {
      period,
      generatedAt: now,
      metrics: {
        tasksCompleted: completed.length,
        tasksBlocked: blocked.length,
        completionRate: tasks.length ? completed.length / tasks.length : 0
      },
      goalsAtRisk,
      decisionsToRevisit,
      ignoredRecommendations,
      prompts: [
        blocked.length ? 'What is the smallest action that can unblock progress?' : null,
        goalsAtRisk.length ? 'Which goal needs scope, deadline or resource adjustment?' : null,
        decisionsToRevisit.length ? 'What evidence was missing when the decision was made?' : null
      ].filter(Boolean),
      requiresHumanReflection: true
    };
  }
}

module.exports = { ReviewReflectionEngine };
