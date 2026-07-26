export function createImportBatch(items=[],{provider,accountId,startedAt=new Date().toISOString()}={}) {
  return {id:`${provider}:${accountId}:${startedAt}`,provider,accountId,startedAt,count:items.length,items:items.map(x=>structuredClone(x)),status:'prepared'};
}
