export function createCapabilityRegistry(){
  const capabilities=new Map();

  return {
    register({id,name,execute,risk='low',requiresApproval=false}={}){
      if(!id||!name||typeof execute!=='function') throw new Error('capability id, name and execute are required');
      capabilities.set(id,{id,name,execute,risk,requiresApproval});
      return id;
    },

    get(id){
      const capability=capabilities.get(id);
      return capability?{id:capability.id,name:capability.name,risk:capability.risk,requiresApproval:capability.requiresApproval}:null;
    },

    async execute(id,input={},context={}){
      const capability=capabilities.get(id);
      if(!capability) throw new Error(`unknown capability: ${id}`);
      return capability.execute(structuredClone(input),structuredClone(context));
    },

    list(){
      return [...capabilities.values()].map(item=>({
        id:item.id,
        name:item.name,
        risk:item.risk,
        requiresApproval:item.requiresApproval
      }));
    }
  };
}
