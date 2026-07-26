export function createLabelMemory(){
  const labels=new Map();
  return {
    remember(key,label,confidence=1){
      labels.set(key,{label,confidence,updatedAt:new Date().toISOString()});
      return structuredClone(labels.get(key));
    },
    recall(key){
      const item=labels.get(key);
      return item?structuredClone(item):null;
    },
    forget(key){return labels.delete(key);},
    list(){return Object.fromEntries([...labels.entries()].map(([k,v])=>[k,structuredClone(v)]));}
  };
}
