export function createConnectorRegistry(){
  const connectors=new Map();

  return {
    register(connector){
      if(!connector?.id) throw new Error('connector id is required');
      if(connectors.has(connector.id)) throw new Error(`connector already registered: ${connector.id}`);
      connectors.set(connector.id,connector);
      return connector.id;
    },
    get(id){return connectors.get(id)||null;},
    list(){
      return [...connectors.values()].map(({id,name,type})=>({id,name,type}));
    },
    async connect(id,context={}){
      const connector=connectors.get(id);
      if(!connector) throw new Error(`unknown connector: ${id}`);
      return connector.connect(structuredClone(context));
    },
    async sync(id,cursor=null,context={}){
      const connector=connectors.get(id);
      if(!connector) throw new Error(`unknown connector: ${id}`);
      return connector.sync(cursor,structuredClone(context));
    }
  };
}
