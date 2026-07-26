export function createDependencyGraph(){
  const nodes=new Map();
  const edges=new Map();

  return {
    addNode(node){
      if(!node?.id) throw new Error('node id is required');
      nodes.set(node.id,structuredClone(node));
      if(!edges.has(node.id)) edges.set(node.id,new Set());
    },

    addDependency(taskId,dependsOnId){
      if(!nodes.has(taskId)||!nodes.has(dependsOnId)) throw new Error('unknown dependency node');
      edges.get(taskId).add(dependsOnId);
    },

    ready(completedIds=[]){
      const completed=new Set(completedIds);
      return [...nodes.values()]
        .filter(node=>[...(edges.get(node.id)||[])].every(id=>completed.has(id)))
        .map(node=>structuredClone(node));
    },

    topologicalOrder(){
      const pending=new Map([...edges.entries()].map(([id,set])=>[id,new Set(set)]));
      const output=[];

      while(pending.size){
        const ready=[...pending.entries()].filter(([,deps])=>deps.size===0).map(([id])=>id);
        if(!ready.length) throw new Error('dependency cycle detected');

        for(const id of ready){
          output.push(structuredClone(nodes.get(id)));
          pending.delete(id);
          for(const deps of pending.values()) deps.delete(id);
        }
      }
      return output;
    }
  };
}
