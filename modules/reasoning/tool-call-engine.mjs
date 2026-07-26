export function createToolCallEngine(tools=[]){
  const registry=new Map(tools.map(tool=>[tool.name,tool]));
  return {
    list(){return [...registry.keys()];},
    async execute(call){
      const tool=registry.get(call.name);
      if(!tool) throw new Error(`unknown tool: ${call.name}`);
      if(typeof tool.validate==='function'&&!tool.validate(call.arguments||{})) throw new Error('invalid tool arguments');
      return tool.run(structuredClone(call.arguments||{}));
    }
  };
}
