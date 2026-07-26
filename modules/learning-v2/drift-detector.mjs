export function detectDistributionDrift(reference=[],current=[],{threshold=0.2}={}){
  const keys=[...new Set([...Object.keys(reference),...Object.keys(current)])];
  const distance=keys.reduce((sum,key)=>sum+Math.abs((reference[key]||0)-(current[key]||0)),0)/2;
  return {drift:distance>=threshold,distance,threshold};
}
