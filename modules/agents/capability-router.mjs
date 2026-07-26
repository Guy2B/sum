export function routeTask(task,agents=[]){
  const matches=agents.map(agent=>({
    agent,
    score:(task.requiredCapabilities||[]).reduce((s,c)=>s+(agent.capabilities.includes(c)?1:0),0)
  })).sort((a,b)=>b.score-a.score);
  return matches[0]?.score>0?matches[0].agent:null;
}
