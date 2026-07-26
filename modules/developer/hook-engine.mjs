export function createHookEngine(){
  const hooks=new Map();
  return {
    register(name,fn,priority=0){
      const list=hooks.get(name)||[];
      list.push({fn,priority});
      list.sort((a,b)=>b.priority-a.priority);
      hooks.set(name,list);
    },
    async run(name,context){
      let current=structuredClone(context);
      for(const hook of hooks.get(name)||[]) current=await hook.fn(current);
      return current;
    }
  };
}
