export function createSecretReference({name,provider='local',path,version='latest'}={}) {
  if(!name||!path) throw new Error('secret name and path are required');
  return {name,provider,path,version};
}
