export function createHealthProbe(){
  const checks=new Map();
  return {
    register(name,check){
      if(!name||typeof check!=='function') throw new Error('health check name and function are required');
      checks.set(name,check);
    },
    async run(){
      const results=[];
      for(const [name,check] of checks){
        try{
          const detail=await check();
          results.push({name,status:detail?.status||'healthy',detail:structuredClone(detail||{})});
        }catch(error){
          results.push({name,status:'unhealthy',detail:{error:error.message}});
        }
      }
      const status=results.some(item=>item.status==='unhealthy')
        ? 'unhealthy'
        : results.some(item=>item.status==='degraded')
          ? 'degraded'
          : 'healthy';
      return {status,checks:results};
    }
  };
}
