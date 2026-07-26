export function createSloPolicy({id,name,target,window='30d',indicator}={}){
  if(!id||!name||!indicator) throw new Error('slo id, name and indicator are required');
  const numericTarget=Number(target);
  if(!Number.isFinite(numericTarget)||numericTarget<=0||numericTarget>1) throw new Error('target must be between 0 and 1');
  return {id,name,target:numericTarget,window,indicator:structuredClone(indicator)};
}

export function evaluateSlo(policy,{good,total}={}){
  const ratio=total>0?good/total:1;
  return {
    policyId:policy.id,
    ratio,
    target:policy.target,
    met:ratio>=policy.target,
    errorBudgetRemaining:Math.max(0,(1-policy.target)-(1-ratio))
  };
}
