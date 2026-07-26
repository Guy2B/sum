export function createLogBuffer({maxEntries=500}={}){
  const entries=[];
  return {
    write(entry){
      const item={
        sequence:entries.length?entries[entries.length-1].sequence+1:1,
        timestamp:new Date().toISOString(),
        level:'info',
        ...structuredClone(entry)
      };
      entries.push(item);
      while(entries.length>maxEntries) entries.shift();
      return structuredClone(item);
    },
    query({level,source,traceId,limit=100}={}){
      return entries
        .filter(item=>!level||item.level===level)
        .filter(item=>!source||item.source===source)
        .filter(item=>!traceId||item.traceId===traceId)
        .slice(-limit)
        .map(item=>structuredClone(item));
    },
    size(){return entries.length;}
  };
}
