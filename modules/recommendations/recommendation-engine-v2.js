'use strict';
class RecommendationEngineV2 {
  generate({ candidates = [], context = {} }) {
    return candidates.map(candidate => {
      const impact = Number(candidate.impact ?? 0.5); const urgency = Number(candidate.urgency ?? 0.5); const confidence = Number(candidate.confidence ?? 0.5);
      const score = Math.max(0,Math.min(1, impact*0.4 + urgency*0.35 + confidence*0.25));
      return { id:candidate.id, action:candidate.action, score, confidence, expectedImpact:impact, evidence:[...(candidate.evidence||[])], explanation:this.explain(candidate,context,score) };
    }).sort((a,b)=>b.score-a.score);
  }
  explain(candidate, context, score) { const goal = candidate.goalId ? ` goal ${candidate.goalId}` : ''; const constraint = context.availableMinutes != null ? ` within ${context.availableMinutes} available minutes` : ''; return `Prioritized${goal}${constraint}; composite score ${score.toFixed(2)} from impact, urgency, and confidence.`; }
}
module.exports = { RecommendationEngineV2 };
