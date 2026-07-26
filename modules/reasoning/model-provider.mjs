export function createModelProvider({id,name,capabilities=[],invoke}={}) {
  if(!id||!name||typeof invoke!=='function') throw new Error('provider id, name and invoke are required');
  return {
    id,
    name,
    capabilities:[...new Set(capabilities)],
    async invoke(request){
      return invoke(structuredClone(request));
    }
  };
}
