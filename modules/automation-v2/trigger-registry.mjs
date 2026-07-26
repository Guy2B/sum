export function createTriggerRegistry(){
  const handlers=new Map();
  return {
    register(type,handler){
      if(!type||typeof handler!=='function') throw new Error('trigger type and handler are required');
      handlers.set(type,handler);
      return type;
    },
    async evaluate(type,event={},config={}){
      const handler=handlers.get(type);
      if(!handler) throw new Error(`unknown trigger: ${type}`);
      return Boolean(await handler(structuredClone(event),structuredClone(config)));
    },
    list(){return [...handlers.keys()];}
  };
}
