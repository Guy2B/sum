export function createDependencyGraph(){
  const deps=new Map();
  return {
    add(task,requires=[]){deps.set(task,[...new Set(requires)]);},
    order(){
      const out=[],temp=new Set(),perm=new Set();
      function visit(n){if(perm.has(n))return;if(temp.has(n))throw new Error('dependency cycle');temp.add(n);for(const d of deps.get(n)||[])visit(d);temp.delete(n);perm.add(n);out.push(n);}
      for(const n of deps.keys())visit(n);return out;
    }
  };
}
