export function normalizeExternalRecord(record,mapping={}){
  const output={};
  for(const [target,source] of Object.entries(mapping)){
    output[target]=typeof source==='function'?source(record):record?.[source];
  }
  return output;
}
