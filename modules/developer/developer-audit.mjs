export function createDeveloperAudit(){
  const entries=[];
  return {
    record(entry){
      const item={sequence:entries.length+1,timestamp:new Date().toISOString(),...structuredClone(entry)};
      entries.push(item);
      return structuredClone(item);
    },
    list({actor,extensionId}={}){
      return entries.filter(x=>!actor||x.actor===actor).filter(x=>!extensionId||x.extensionId===extensionId).map(x=>structuredClone(x));
    }
  };
}
