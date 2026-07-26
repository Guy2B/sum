export function buildTradeoffMatrix(options=[],criteria=[]){
  return options.map(option=>{
    const scores=criteria.map(criterion=>{
      const value=Number(option.metrics?.[criterion.metric]??0);
      const normalized=criterion.direction==='minimize'
        ? 1/(1+Math.max(0,value))
        : Math.max(0,value);
      return {
        criterion:criterion.metric,
        value,
        weight:criterion.weight??1,
        normalized
      };
    });
    const totalWeight=scores.reduce((sum,item)=>sum+item.weight,0)||1;
    const total=scores.reduce((sum,item)=>sum+(item.normalized*item.weight),0)/totalWeight;
    return {optionId:option.id,total,scores};
  }).sort((a,b)=>b.total-a.total);
}
