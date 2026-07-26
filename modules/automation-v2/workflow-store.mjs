export function createWorkflowStore(){
  const workflows=new Map();
  return {
    save(workflow){workflows.set(workflow.id,structuredClone(workflow));return structuredClone(workflow);},
    get(id){const item=workflows.get(id);return item?structuredClone(item):null;},
    list(){return [...workflows.values()].map(item=>structuredClone(item));},
    remove(id){return workflows.delete(id);},
    setEnabled(id,enabled){
      const item=workflows.get(id);
      if(!item) throw new Error('unknown workflow');
      item.enabled=Boolean(enabled);
      workflows.set(id,item);
      return structuredClone(item);
    }
  };
}
