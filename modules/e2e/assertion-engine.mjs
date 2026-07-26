export function assertScenario(result, expectations=[]) {
  const failures=[];
  for(const exp of expectations){
    const actual=exp.path.split('.').reduce((v,k)=>v?.[k],result);
    if(exp.equals!==undefined && actual!==exp.equals) failures.push(`${exp.path}: expected ${exp.equals}, got ${actual}`);
    if(exp.exists && actual===undefined) failures.push(`${exp.path}: missing`);
  }
  return {ok:failures.length===0,failures};
}
