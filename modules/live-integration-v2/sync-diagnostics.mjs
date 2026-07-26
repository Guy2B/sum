export function createSyncDiagnostics(){
  const events=[];

  return {
    record(entry){
      const item={
        sequence:events.length+1,
        timestamp:new Date().toISOString(),
        ...structuredClone(entry)
      };
      events.push(item);
      return structuredClone(item);
    },
    summary(){
      const completed=events.filter(item=>item.type==='sync-completed');
      const failed=events.filter(item=>item.type==='sync-failed');
      const latest=events[events.length-1]||null;
      return {
        totalEvents:events.length,
        completed:completed.length,
        failed:failed.length,
        latest:latest?structuredClone(latest):null
      };
    },
    list(filters={}){
      return events
        .filter(item=>!filters.connectorId||item.connectorId===filters.connectorId)
        .filter(item=>!filters.type||item.type===filters.type)
        .map(item=>structuredClone(item));
    }
  };
}
