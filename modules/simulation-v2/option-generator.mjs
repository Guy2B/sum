export function generateOptions({
  dimensions={},
  base={}
}={}){
  const entries=Object.entries(dimensions);
  const results=[];

  function walk(index,current){
    if(index>=entries.length){
      results.push({...structuredClone(base),...structuredClone(current)});
      return;
    }
    const [key,values]=entries[index];
    for(const value of values){
      walk(index+1,{...current,[key]:value});
    }
  }

  walk(0,{});
  return results;
}
