export function createDriveAdapter(client){
  return {
    async listSignals({query='',cursor=null}={}){
      return client.listFiles({query,cursor});
    },
    normalize(file){
      return {
        externalId:file.id,
        type:'document',
        title:file.name||'(sans nom)',
        modifiedAt:file.modifiedTime||null,
        mimeType:file.mimeType||null,
        raw:structuredClone(file)
      };
    }
  };
}
