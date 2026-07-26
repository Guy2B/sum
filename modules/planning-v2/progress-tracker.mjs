export function calculateProgress(items=[]){
  const weighted=items.map(item=>({
    weight:Number(item.weight??1),
    progress:Math.max(0,Math.min(1,Number(item.progress??(item.status==='completed'?1:0))))
  }));

  const totalWeight=weighted.reduce((sum,item)=>sum+item.weight,0)||1;
  const progress=weighted.reduce((sum,item)=>sum+(item.progress*item.weight),0)/totalWeight;

  return {
    progress,
    percent:Math.round(progress*100),
    completed:items.filter(item=>item.status==='completed').length,
    total:items.length
  };
}
