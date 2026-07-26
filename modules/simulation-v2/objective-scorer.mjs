export function scoreObjectives(objectives=[],outcomes={}){
  const details=objectives.map(objective=>{
    const actual=outcomes[objective.metric];
    const target=objective.target;
    let normalized=0;
    if(typeof actual==='number'&&typeof target==='number'){
      normalized=objective.direction==='minimize'
        ? (actual===0?1:Math.min(1,target/actual))
        : (target===0?1:Math.min(1,actual/target));
    }
    const weight=objective.weight??1;
    return {
      id:objective.id||objective.metric,
      metric:objective.metric,
      actual,
      target,
      weight,
      score:normalized
    };
  });
  const totalWeight=details.reduce((sum,item)=>sum+item.weight,0)||1;
  const score=details.reduce((sum,item)=>sum+(item.score*item.weight),0)/totalWeight;
  return {score,details};
}
