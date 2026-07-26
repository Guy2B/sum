export function createExtensionLoader({policy}={}){
  const loaded=new Map();
  return {
    load(extension,module){
      const decision=policy(extension);
      if(!decision.allowed) throw new Error(decision.reason);
      loaded.set(extension.id,{extension:structuredClone(extension),module});
      return structuredClone(extension);
    },
    get(id){return loaded.get(id)?.module||null;},
    list(){return [...loaded.values()].map(x=>structuredClone(x.extension));},
    unload(id){return loaded.delete(id);}
  };
}
