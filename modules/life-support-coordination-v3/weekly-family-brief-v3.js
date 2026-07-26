(function(g){
  function build({members=[],plans=[],milestones=[],events=[],jobItems=[]}={}){
    const urgentTasks=plans.flatMap(p=>(p.tasks||[]).filter(t=>!t.done&&t.urgent).map(t=>({...t,planTitle:p.title})));
    const upcomingMilestones=milestones.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,5);
    const followups=window.SigmaApplicationFollowupEngineV3?window.SigmaApplicationFollowupEngineV3.due(jobItems):[];
    return{
      generatedAt:new Date().toISOString(),
      people:members.length,
      activePlans:plans.filter(x=>x.status==='active').length,
      urgentTasks,
      upcomingMilestones,
      externalEvents:events.length,
      jobFollowups:followups,
      summary:`${urgentTasks.length} urgence(s), ${upcomingMilestones.length} étape(s), ${followups.length} relance(s).`
    };
  }
  g.SigmaWeeklyFamilyBriefV3={build};
})(window);
