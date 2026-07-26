export function planDeployment(units=[],{strategy='rolling',batchSize=1}={}){
  const batches=[];
  for(let i=0;i<units.length;i+=batchSize){
    batches.push({
      sequence:batches.length+1,
      strategy,
      units:units.slice(i,i+batchSize).map(x=>structuredClone(x)),
      status:'planned'
    });
  }
  return batches;
}
