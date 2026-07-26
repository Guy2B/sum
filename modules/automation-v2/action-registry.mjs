export function createActionRegistry(){
  const handlers=new Map();
  return {
    register(type,handler){
      if(!type||typeof handler!=='function') throw new Error('action type and handler are required');
      handlers.set(type,handler);
      return type;
    },
    async execute(type,config={},context={}){
      const handler=handlers.get(type);
      if(!handler) throw new Error(`unknown action: ${type}`);
      return handler(structuredClone(config),structuredClone(context));
    },
    list(){return [...handlers.keys()];}
  };
}
