export function assessRisk(option,{impact=0,likelihood=0,mitigations=[]}={}){
  const raw=Math.max(0,Math.min(1,impact))*Math.max(0,Math.min(1,likelihood));
  const reduction=Math.min(.8,mitigations.reduce((s,m)=>s+Number(m.effect||0),0));
  return {optionId:option.id,rawRisk:raw,residualRisk:Math.max(0,raw*(1-reduction)),mitigations};
}
