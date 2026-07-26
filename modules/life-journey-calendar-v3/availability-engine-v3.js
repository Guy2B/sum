(function(g){
  function toDate(value){const d=new Date(value);return Number.isNaN(d.getTime())?null:d;}
  function busyIntervals(events,day){
    const start=new Date(day);start.setHours(0,0,0,0);const end=new Date(start);end.setDate(end.getDate()+1);
    return (events||[]).map(e=>({start:toDate(e.start),end:toDate(e.end)||new Date(toDate(e.start)?.getTime()+3600000),event:e})).filter(x=>x.start&&x.end&&x.start<end&&x.end>start).sort((a,b)=>a.start-b.start);
  }
  function freeSlots(events,day,{startHour=8,endHour=20,minMinutes=30}={}){
    let cursor=new Date(day);cursor.setHours(startHour,0,0,0);const limit=new Date(day);limit.setHours(endHour,0,0,0);const slots=[];
    for(const busy of busyIntervals(events,day)){
      if(busy.start>cursor&&(busy.start-cursor)/60000>=minMinutes)slots.push({start:new Date(cursor),end:new Date(busy.start),minutes:(busy.start-cursor)/60000});
      if(busy.end>cursor)cursor=new Date(busy.end);
    }
    if(limit>cursor&&(limit-cursor)/60000>=minMinutes)slots.push({start:new Date(cursor),end:limit,minutes:(limit-cursor)/60000});
    return slots;
  }
  g.SigmaAvailabilityEngineV3={busyIntervals,freeSlots};
})(window);
