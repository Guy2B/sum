export function createGoal({
  id,
  title,
  description='',
  ownerId=null,
  targetDate=null,
  status='draft',
  metrics=[],
  tags=[]
}={}){
  if(!id||!title) throw new Error('goal id and title are required');
  return {
    id,
    title,
    description,
    ownerId,
    targetDate,
    status,
    metrics:metrics.map(metric=>structuredClone(metric)),
    tags:[...new Set(tags)]
  };
}
