export function coordinate(task,agents=[]){
  const assignments=[];
  for(const capability of task.requiredCapabilities||[]){
    const agent=agents.find(a=>a.capabilities.includes(capability));
    if(agent)assignments.push({capability,agentId:agent.id});
  }
  return {taskId:task.id,assignments,complete:assignments.length===(task.requiredCapabilities||[]).length};
}
