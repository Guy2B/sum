export function planMilestones({
  goalId,
  startDate,
  targetDate,
  count=4,
  labels=[]
}={}){
  if(!goalId||!startDate||!targetDate) throw new Error('goalId, startDate and targetDate are required');
  if(!Number.isInteger(count)||count<=0) throw new Error('count must be a positive integer');

  const start=new Date(startDate).getTime();
  const end=new Date(targetDate).getTime();
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start) throw new Error('invalid date range');

  const step=(end-start)/count;
  return Array.from({length:count},(_,index)=>({
    id:`${goalId}_milestone_${index+1}`,
    goalId,
    title:labels[index]||`Milestone ${index+1}`,
    dueAt:new Date(start+(step*(index+1))).toISOString(),
    status:'pending',
    order:index+1
  }));
}
