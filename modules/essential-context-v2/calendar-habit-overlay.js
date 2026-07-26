(function(g){
  function detectConflicts(events,habits){
    const conflicts=[];
    for(const habit of habits||[]){
      const hs=new Date(habit.startAt||habit.start);const he=new Date(habit.endAt||habit.end||hs.getTime()+30*60000);
      for(const event of events||[]){
        const es=new Date(event.start);const ee=new Date(event.end||es.getTime()+60*60000);
        if(hs<ee&&he>es)conflicts.push({habit,event,type:'time-overlap'});
      }
    }
    return conflicts;
  }
  function suggest(events,habits){
    return detectConflicts(events,habits).map(x=>({type:'reschedule-habit',habitId:x.habit.id,eventId:x.event.id,message:`Déplacer « ${x.habit.title||'habitude'} » autour de « ${x.event.title} »`}));
  }
  g.SigmaCalendarHabitOverlay={detectConflicts,suggest};
})(window);
