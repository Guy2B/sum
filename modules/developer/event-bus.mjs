export function createEventBus(){
  const handlers=new Map();
  return {
    subscribe(topic,handler){
      const list=handlers.get(topic)||[];
      list.push(handler);
      handlers.set(topic,list);
      return ()=>handlers.set(topic,(handlers.get(topic)||[]).filter(x=>x!==handler));
    },
    async publish(topic,payload){
      const results=[];
      for(const handler of handlers.get(topic)||[]) results.push(await handler(structuredClone(payload)));
      return results;
    },
    topics(){return [...handlers.keys()];}
  };
}
