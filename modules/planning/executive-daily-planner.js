'use strict';
class ExecutiveDailyPlanner {
  constructor({ recommendationEngine, temporalEngine }) { this.recommendationEngine=recommendationEngine; this.temporalEngine=temporalEngine; }
  build({ date, commitments=[], tasks=[], goals=[] }) {
    const dayStart=new Date(`${date}T00:00:00.000Z`), dayEnd=new Date(`${date}T23:59:59.999Z`);
    const todayCommitments=commitments.filter(c=>new Date(c.start)<=dayEnd&&new Date(c.end)>=dayStart);
    const candidates=tasks.map(t=>({ id:t.id, action:t.title, impact:t.impact, urgency:t.urgency, confidence:t.confidence, goalId:t.goalId, evidence:t.evidence }));
    const recommendations=this.recommendationEngine.generate({ candidates, context:{ date, availableMinutes:1440-todayCommitments.reduce((n,c)=>n+(new Date(c.end)-new Date(c.start))/60000,0) } });
    const threatenedGoals=goals.filter(g=>Number(g.progress??0)<Number(g.expectedProgress??0));
    const conflicts=[]; for(let i=0;i<todayCommitments.length;i++)for(let j=i+1;j<todayCommitments.length;j++)if(this.temporalEngine.overlaps(todayCommitments[i],todayCommitments[j]))conflicts.push([todayCommitments[i].id,todayCommitments[j].id]);
    return { date, priorities:recommendations.slice(0,3), scheduledCommitments:todayCommitments, conflicts, threatenedGoals, requiresApproval:true };
  }
}
module.exports = { ExecutiveDailyPlanner };
