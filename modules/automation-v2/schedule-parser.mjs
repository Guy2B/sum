export function parseSchedule(schedule){
  if(!schedule) throw new Error('schedule is required');
  if(schedule.type==='interval'){
    const every=Number(schedule.every);
    if(!Number.isFinite(every)||every<=0) throw new Error('invalid interval');
    return {type:'interval',every,unit:schedule.unit||'minutes'};
  }
  if(schedule.type==='daily'){
    const match=/^(\d{2}):(\d{2})$/.exec(schedule.time||'');
    if(!match) throw new Error('invalid daily time');
    const hour=Number(match[1]),minute=Number(match[2]);
    if(hour>23||minute>59) throw new Error('invalid daily time');
    return {type:'daily',hour,minute,timezone:schedule.timezone||'UTC'};
  }
  throw new Error(`unsupported schedule type: ${schedule.type}`);
}
