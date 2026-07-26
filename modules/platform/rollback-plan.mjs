export function createRollbackPlan(deployments=[]){
  return [...deployments].reverse().map((deployment,index)=>({
    sequence:index+1,
    deploymentId:deployment.id,
    action:'rollback',
    targetVersion:deployment.previousVersion||null,
    status:'planned'
  }));
}
