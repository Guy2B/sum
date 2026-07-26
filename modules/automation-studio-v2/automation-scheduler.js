(function(g){
  function due(rule,now=new Date()){
    if(!rule.enabled)return false;
    const last=rule.lastRunAt?new Date(rule.lastRunAt):null;
    if(rule.trigger?.type==='daily'){
      const target=new Date(now);target.setHours(Number(rule.trigger.hour||0),Number(rule.trigger.minute||0),0,0);
      return now>=target&&(!last||last<target);
    }
    if(rule.trigger?.type==='interval'){
      const ms=Math.max(1,Number(rule.trigger.minutes||60))*60000;
      return !last||(now-last)>=ms;
    }
    if(rule.trigger?.type==='event')return false;
    return false;
  }
  function nextRun(rule,now=new Date()){
    if(rule.trigger?.type==='daily'){
      const target=new Date(now);target.setHours(Number(rule.trigger.hour||0),Number(rule.trigger.minute||0),0,0);
      if(target<=now)target.setDate(target.getDate()+1);
      return target.toISOString();
    }
    if(rule.trigger?.type==='interval'){
      const base=rule.lastRunAt?new Date(rule.lastRunAt):now;
      return new Date(base.getTime()+Math.max(1,Number(rule.trigger.minutes||60))*60000).toISOString();
    }
    return null;
  }
  g.SigmaAutomationScheduler={due,nextRun};
})(window);
