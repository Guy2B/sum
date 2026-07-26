export function createExtension({id,name,version='1.0.0',capabilities=[],entrypoint,metadata={}}={}) {
  if(!id||!name||!entrypoint) throw new Error('extension id, name and entrypoint are required');
  return {
    id,
    name,
    version,
    capabilities:[...new Set(capabilities)],
    entrypoint,
    metadata:structuredClone(metadata)
  };
}
