export function evaluateCapacity({
  availableHours=0,
  commitments=[]
}={}){
  const usedHours=commitments.reduce((sum,item)=>sum+Number(item.hours||0),0);
  const remainingHours=availableHours-usedHours;
  return {
    availableHours,
    usedHours,
    remainingHours,
    utilization:availableHours>0?usedHours/availableHours:0,
    overloaded:remainingHours<0
  };
}
