export function analyzeSensitivity({
  baseline={},
  variables={},
  evaluate
}={}){
  if(typeof evaluate!=='function') throw new Error('evaluate is required');
  const baseScore=evaluate(structuredClone(baseline));
  const results=[];

  for(const [name,values] of Object.entries(variables)){
    for(const value of values){
      const candidate={...structuredClone(baseline),[name]:value};
      const score=evaluate(candidate);
      results.push({
        variable:name,
        value,
        score,
        delta:score-baseScore
      });
    }
  }

  return {baseScore,results};
}
