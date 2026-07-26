export function createConnectorContract({id,name,provider,capabilities=[],auth='none'}={}) {
  if(!id||!name||!provider) throw new Error('connector id, name and provider are required');
  return {
    id,
    name,
    provider,
    capabilities:[...new Set(capabilities)],
    auth,
    version:'1.0.0'
  };
}
