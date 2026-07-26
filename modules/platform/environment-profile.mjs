export function createEnvironmentProfile({name,region='local',replicas=1,features={},limits={}}={}) {
  if(!name) throw new Error('environment name is required');
  return {
    name,
    region,
    replicas:Math.max(1,Number(replicas)),
    features:structuredClone(features),
    limits:structuredClone(limits)
  };
}
