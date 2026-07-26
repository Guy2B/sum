export function createConversationMemory({maxEntries=100}={}){
  const entries=[];
  return {
    append(entry){
      entries.push({id:entry.id||`memory_${entries.length+1}`,timestamp:new Date().toISOString(),...structuredClone(entry)});
      while(entries.length>maxEntries) entries.shift();
      return structuredClone(entries.at(-1));
    },
    recent(limit=10){return entries.slice(-limit).map(x=>structuredClone(x));},
    search(term){const q=String(term).toLowerCase();return entries.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>structuredClone(x));}
  };
}
