export function createDeploymentUnit({id,version,artifact,environment,status='planned'}={}) {
  if(!id||!version||!artifact||!environment) throw new Error('deployment unit fields are required');
  return {id,version,artifact,environment,status,createdAt:new Date().toISOString()};
}
