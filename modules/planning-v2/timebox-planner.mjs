export function buildTimeboxes(tasks=[],{
  startAt,
  defaultDurationMinutes=30,
  breakMinutes=0
}={}){
  if(!startAt) throw new Error('startAt is required');
  let cursor=new Date(startAt).getTime();
  if(!Number.isFinite(cursor)) throw new Error('invalid startAt');

  return tasks.map(task=>{
    const duration=Number(task.durationMinutes||defaultDurationMinutes);
    const start=new Date(cursor).toISOString();
    cursor+=duration*60000;
    const end=new Date(cursor).toISOString();
    cursor+=breakMinutes*60000;
    return {
      taskId:task.id,
      title:task.title,
      startAt:start,
      endAt:end,
      durationMinutes:duration
    };
  });
}
