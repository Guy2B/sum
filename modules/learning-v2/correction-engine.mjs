export function applyCorrection(item={},correction={}){
  const output=structuredClone(item);
  const changes=[];
  for(const [field,value] of Object.entries(correction.fields||{})){
    changes.push({field,from:output[field],to:value});
    output[field]=structuredClone(value);
  }
  return {
    item:output,
    changes,
    correctedAt:new Date().toISOString(),
    reason:correction.reason||null
  };
}
