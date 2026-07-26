export function quantifyUncertainty(values=[]){
  if(!values.length) return {mean:0,variance:0,confidence:0};
  const mean=values.reduce((a,b)=>a+b,0)/values.length;
  const variance=values.reduce((s,v)=>s+(v-mean)**2,0)/values.length;
  return {mean,variance,confidence:1/(1+variance)};
}
