export function createIdempotencyStore(){
  const records=new Map();

  return {
    has(key){return records.has(key);},

    get(key){
      const item=records.get(key);
      return item?structuredClone(item):null;
    },

    set(key,value){
      if(!key) throw new Error('idempotency key is required');
      if(records.has(key)) return structuredClone(records.get(key));
      const item={
        key,
        value:structuredClone(value),
        createdAt:new Date().toISOString()
      };
      records.set(key,item);
      return structuredClone(item);
    },

    delete(key){return records.delete(key);}
  };
}
