export function redactRecord(record={},classification,{
  mask='[REDACTED]',
  allowedClassifications=['public','internal']
}={}){
  const sensitiveFields=new Map(
    (classification?.fields||[]).map(item=>[item.field,item.classification])
  );
  const output={};
  for(const [key,value] of Object.entries(record)){
    const level=sensitiveFields.get(key);
    output[key]=level&&!allowedClassifications.includes(level)?mask:structuredClone(value);
  }
  return output;
}
