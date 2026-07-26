export function detectAnomaly(series=[],value,{zThreshold=3}={}){
  if(series.length<2) return {anomaly:false,zScore:0,mean:value,stddev:0};
  const mean=series.reduce((sum,item)=>sum+item,0)/series.length;
  const variance=series.reduce((sum,item)=>sum+((item-mean)**2),0)/series.length;
  const stddev=Math.sqrt(variance);
  const zScore=stddev===0?(value===mean?0:Infinity):(value-mean)/stddev;
  return {anomaly:Math.abs(zScore)>=zThreshold,zScore,mean,stddev};
}
