export function optimizePlan(tasks=[],{
  capacityHours=Infinity,
  score=item=>Number(item.priority||0)
}={}){
  const ranked=[...tasks].sort((a,b)=>score(b)-score(a));
  const selected=[];
  const deferred=[];
  let usedHours=0;

  for(const task of ranked){
    const hours=Number(task.hours||0);
    if(usedHours+hours<=capacityHours){
      selected.push(structuredClone(task));
      usedHours+=hours;
    }else{
      deferred.push(structuredClone(task));
    }
  }

  return {
    selected,
    deferred,
    usedHours,
    remainingHours:capacityHours-usedHours
  };
}
