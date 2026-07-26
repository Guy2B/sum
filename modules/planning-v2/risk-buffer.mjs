export function applyRiskBuffer(estimate,{
  uncertainty=0,
  minimumBuffer=0
}={}){
  const base=Number(estimate);
  const buffer=Math.max(minimumBuffer,base*Math.max(0,Number(uncertainty)));
  return {
    estimate:base,
    buffer,
    bufferedEstimate:base+buffer
  };
}
