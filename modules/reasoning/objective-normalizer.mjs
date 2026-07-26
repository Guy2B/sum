export function normalizeObjectives(objectives=[]){
  const total=objectives.reduce((s,o)=>s+Math.max(0,o.weight||0),0)||1;
  return objectives.map(o=>({...o,normalizedWeight:Math.max(0,o.weight||0)/total}));
}
