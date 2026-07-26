export function generateCounterfactual({
  input={},
  target,
  mutableFields=[],
  candidates={},
  evaluate
}={}){
  if(typeof evaluate!=='function') throw new Error('evaluate is required');
  const baseline=evaluate(structuredClone(input));
  const attempts=[];

  for(const field of mutableFields){
    for(const value of candidates[field]||[]){
      const candidate={...structuredClone(input),[field]:value};
      const outcome=evaluate(candidate);
      const reached=typeof target==='function'?target(outcome):outcome===target;
      const item={field,value,outcome,reached};
      attempts.push(item);
      if(reached) return {found:true,baseline,counterfactual:candidate,attempt:item,attempts};
    }
  }

  return {found:false,baseline,counterfactual:null,attempt:null,attempts};
}
