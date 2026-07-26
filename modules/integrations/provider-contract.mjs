export function createProvider({id,name,kind,capabilities=[],version='1.0.0',metadata={}}={}) {
  if(!id||!name||!kind) throw new Error('provider id, name and kind are required');
  return {id,name,kind,capabilities:[...new Set(capabilities)],version,metadata:structuredClone(metadata)};
}
