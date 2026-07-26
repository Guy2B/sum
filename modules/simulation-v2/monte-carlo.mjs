export function runMonteCarlo({
  iterations=1000,
  sample,
  evaluate
}={}){
  if(typeof sample!=='function'||typeof evaluate!=='function') throw new Error('sample and evaluate are required');
  const values=[];
  for(let index=0;index<iterations;index++){
    values.push(Number(evaluate(sample(index))));
  }
  const sorted=[...values].sort((a,b)=>a-b);
  const mean=values.reduce((sum,value)=>sum+value,0)/(values.length||1);
  const percentile=p=>sorted[Math.min(sorted.length-1,Math.max(0,Math.floor((sorted.length-1)*p)))]??null;
  return {
    iterations,
    mean,
    min:sorted[0]??null,
    max:sorted[sorted.length-1]??null,
    p10:percentile(.10),
    p50:percentile(.50),
    p90:percentile(.90),
    values
  };
}
