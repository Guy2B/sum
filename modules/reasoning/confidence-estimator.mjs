export function estimateConfidence({evidence=[],agreement=1,coverage=1,uncertainty=0}={}){
  const evidenceScore=Math.min(1,evidence.length/5);
  const value=Math.max(0,Math.min(1,evidenceScore*.35+agreement*.30+coverage*.25+(1-uncertainty)*.10));
  return {value,level:value>=.8?'high':value>=.5?'medium':'low'};
}
