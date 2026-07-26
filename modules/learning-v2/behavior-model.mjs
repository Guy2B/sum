export function createBehaviorModel(){
  const counts=new Map();
  return {
    observe(eventType,weight=1){
      counts.set(eventType,(counts.get(eventType)||0)+weight);
      return counts.get(eventType);
    },
    probability(eventType){
      const total=[...counts.values()].reduce((sum,value)=>sum+value,0);
      return total>0?(counts.get(eventType)||0)/total:0;
    },
    snapshot(){
      const total=[...counts.values()].reduce((sum,value)=>sum+value,0);
      return Object.fromEntries([...counts.entries()].map(([key,value])=>[
        key,
        {count:value,probability:total>0?value/total:0}
      ]));
    }
  };
}
