export function createRunbookEngine(){
  const runbooks=new Map();
  return {
    register({id,name,steps=[]}={}){
      if(!id||!name) throw new Error('runbook id and name are required');
      const runbook={id,name,steps:steps.map(step=>structuredClone(step))};
      runbooks.set(id,runbook);
      return structuredClone(runbook);
    },
    async execute(id,context={},executor=async step=>step){
      const runbook=runbooks.get(id);
      if(!runbook) throw new Error('unknown runbook');
      const results=[];
      for(const step of runbook.steps){
        results.push({
          stepId:step.id,
          result:await executor(structuredClone(step),structuredClone(context))
        });
      }
      return {runbookId:id,status:'completed',results};
    },
    list(){return [...runbooks.values()].map(item=>structuredClone(item));}
  };
}
