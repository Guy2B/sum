export function createBulkheadManager(){
  const pools=new Map();

  function ensure(name,limit){
    if(!pools.has(name)) pools.set(name,{limit,active:0});
    return pools.get(name);
  }

  return {
    enter(name,{limit=1}={}){
      const pool=ensure(name,limit);
      if(pool.active>=pool.limit) return {accepted:false,active:pool.active,limit:pool.limit};
      pool.active+=1;
      return {accepted:true,active:pool.active,limit:pool.limit};
    },
    leave(name){
      const pool=pools.get(name);
      if(!pool) return 0;
      pool.active=Math.max(0,pool.active-1);
      return pool.active;
    },
    status(name){
      const pool=pools.get(name);
      return pool?structuredClone(pool):null;
    }
  };
}
