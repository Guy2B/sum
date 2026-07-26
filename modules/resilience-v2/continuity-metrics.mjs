export function calculateContinuityMetrics({
  incidents=[],
  totalPeriodMs=0
}={}){
  const downtimeMs=incidents.reduce((sum,item)=>sum+Number(item.downtimeMs||0),0);
  const recoveries=incidents.filter(item=>Number.isFinite(Number(item.recoveryMs)));
  const mttrMs=recoveries.length
    ? recoveries.reduce((sum,item)=>sum+Number(item.recoveryMs),0)/recoveries.length
    : 0;
  const availability=totalPeriodMs>0?Math.max(0,1-(downtimeMs/totalPeriodMs)):1;

  return {
    incidents:incidents.length,
    downtimeMs,
    mttrMs,
    availability
  };
}
