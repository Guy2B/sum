export function scheduleTasks(tasks=[]){
  return [...tasks].sort((a,b)=>{
    const da=a.deadline?new Date(a.deadline).getTime():Infinity;
    const db=b.deadline?new Date(b.deadline).getTime():Infinity;
    if(da!==db)return da-db;
    return b.priority-a.priority;
  });
}
