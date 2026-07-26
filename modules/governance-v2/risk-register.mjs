export function createRiskRegister(){
  const risks=new Map();
  return {
    add({id,title,likelihood=1,impact=1,controls=[]}={}){
      if(!id||!title) throw new Error('risk id and title are required');
      const risk={
        id,
        title,
        likelihood,
        impact,
        score:likelihood*impact,
        controls:[...controls],
        status:'open'
      };
      risks.set(id,risk);
      return structuredClone(risk);
    },
    mitigate(id,control){
      const risk=risks.get(id);
      if(!risk) throw new Error('unknown risk');
      risk.controls.push(control);
      risk.status='mitigated';
      risks.set(id,risk);
      return structuredClone(risk);
    },
    list(){return [...risks.values()].map(item=>structuredClone(item));}
  };
}
