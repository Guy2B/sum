(function(g){
  function calculate(input={}){
    const tasks=input.tasks||[];const people=input.people||[];
    const open=tasks.filter(x=>!x.done);const urgent=open.filter(x=>x.urgent);
    const unassigned=open.filter(x=>!x.assigneeId);
    const load=open.reduce((n,x)=>n+(x.minutes||30),0);
    const capacity=people.reduce((n,x)=>n+(x.availableMinutes||0),0);
    return{open:open.length,urgent:urgent.length,unassigned:unassigned.length,loadMinutes:load,capacityMinutes:capacity,overloaded:load>capacity,ratio:capacity?Math.round(load/capacity*100):null};
  }
  function rebalance(input={}){
    const people=(input.people||[]).map(x=>({...x,remaining:x.availableMinutes||0,tasks:[]}));
    for(const task of (input.tasks||[]).filter(x=>!x.done).sort((a,b)=>(b.urgent?1:0)-(a.urgent?1:0))){
      const person=people.sort((a,b)=>b.remaining-a.remaining)[0];if(!person)break;person.tasks.push(task);person.remaining-=task.minutes||30;
    }
    return people;
  }
  g.SigmaCareLoadEngineV3={calculate,rebalance};
})(window);
