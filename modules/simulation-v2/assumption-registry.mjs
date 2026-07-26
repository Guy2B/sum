export function createAssumptionRegistry(){
  const assumptions=new Map();
  return {
    set({id,label,value,confidence=1,source=null}={}){
      if(!id||!label) throw new Error('assumption id and label are required');
      const item={id,label,value:structuredClone(value),confidence,source,updatedAt:new Date().toISOString()};
      assumptions.set(id,item);
      return structuredClone(item);
    },
    get(id){
      const item=assumptions.get(id);
      return item?structuredClone(item):null;
    },
    list(){
      return [...assumptions.values()].map(item=>structuredClone(item));
    },
    remove(id){return assumptions.delete(id);}
  };
}
