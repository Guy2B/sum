export function consolidateKnowledge(entries=[]){
  const grouped=new Map();
  for(const entry of entries){
    const key=entry.key||entry.topic||'unknown';
    if(!grouped.has(key)) grouped.set(key,[]);
    grouped.get(key).push(entry);
  }
  return [...grouped.entries()].map(([key,items])=>{
    const latest=[...items].sort((a,b)=>new Date(b.timestamp||0)-new Date(a.timestamp||0))[0];
    return {
      key,
      value:structuredClone(latest.value),
      sources:[...new Set(items.map(item=>item.source).filter(Boolean))],
      confidence:items.reduce((sum,item)=>sum+(item.confidence??1),0)/items.length,
      observations:items.length
    };
  });
}
