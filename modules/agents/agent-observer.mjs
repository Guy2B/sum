export function observeRun(events=[]){
  const counts=events.reduce((m,e)=>(m[e.type]=(m[e.type]||0)+1,m),{});
  const failures=events.filter(e=>e.type==='failed');
  return {eventCount:events.length,counts,failed:failures.length,healthy:failures.length===0};
}
