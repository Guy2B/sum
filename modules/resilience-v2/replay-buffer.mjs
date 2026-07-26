export function createReplayBuffer({maxEntries=1000}={}){
  const entries=[];

  return {
    push(event){
      const item={
        sequence:entries.length?entries[entries.length-1].sequence+1:1,
        capturedAt:new Date().toISOString(),
        event:structuredClone(event)
      };
      entries.push(item);
      while(entries.length>maxEntries) entries.shift();
      return item.sequence;
    },
    replay({fromSequence=1,limit=100}={}){
      return entries
        .filter(item=>item.sequence>=fromSequence)
        .slice(0,limit)
        .map(item=>structuredClone(item));
    },
    size(){return entries.length;}
  };
}
