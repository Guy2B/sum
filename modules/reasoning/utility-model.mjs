export function computeUtility(option,objectives=[]){
  const contributions=objectives.map(o=>({id:o.id,value:Number(o.score(option)||0),weight:o.normalizedWeight??o.weight??0}));
  return {score:contributions.reduce((s,c)=>s+c.value*c.weight,0),contributions};
}
