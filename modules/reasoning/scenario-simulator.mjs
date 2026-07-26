export function simulateScenario(option,{probability=1,outcomes=[]}={}){
  const expected=outcomes.reduce((s,o)=>s+Number(o.value||0)*Number(o.probability||0),0);
  return {optionId:option.id,probability,expectedValue:expected*probability,outcomes};
}
