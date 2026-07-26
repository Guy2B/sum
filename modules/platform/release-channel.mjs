export function resolveReleaseChannel({channel='stable',version}={}) {
  if(!version) throw new Error('version is required');
  const rank={canary:1,beta:2,stable:3};
  if(!rank[channel]) throw new Error('unsupported channel');
  return {channel,version,rank:rank[channel]};
}
