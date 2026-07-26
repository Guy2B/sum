export function createEvidenceManager(){
  const evidence=[];
  return {
    add(item){const value={id:item.id||`evidence_${evidence.length+1}`,reliability:item.reliability??.5,...structuredClone(item)};evidence.push(value);return structuredClone(value);},
    list(){return evidence.map(x=>structuredClone(x));},
    strongest(limit=3){return [...evidence].sort((a,b)=>b.reliability-a.reliability).slice(0,limit).map(x=>structuredClone(x));}
  };
}
