export function createDependencyMap(){
  const edges=new Map();
  return {
    connect(from,to){
      if(!edges.has(from)) edges.set(from,new Set());
      edges.get(from).add(to);
    },
    dependenciesOf(node){
      return [...(edges.get(node)||[])];
    },
    impactedBy(node){
      const impacted=new Set();
      const visit=current=>{
        for(const [from,targets] of edges){
          if(targets.has(current)&&!impacted.has(from)){
            impacted.add(from);
            visit(from);
          }
        }
      };
      visit(node);
      return [...impacted];
    },
    snapshot(){
      return Object.fromEntries([...edges.entries()].map(([key,value])=>[key,[...value]]));
    }
  };
}
