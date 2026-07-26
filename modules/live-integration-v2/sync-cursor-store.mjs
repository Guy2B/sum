export function createSyncCursorStore(){
  const cursors=new Map();

  return {
    get(connectorId){
      const item=cursors.get(connectorId);
      return item?structuredClone(item):null;
    },
    set(connectorId,cursor,metadata={}){
      const item={
        connectorId,
        cursor:structuredClone(cursor),
        metadata:structuredClone(metadata),
        updatedAt:new Date().toISOString()
      };
      cursors.set(connectorId,item);
      return structuredClone(item);
    },
    clear(connectorId){return cursors.delete(connectorId);}
  };
}
