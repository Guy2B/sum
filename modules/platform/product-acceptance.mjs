export function validateProductionPlatform(platform){
  const missing=['register','configure','deploy','recordIncident','status'].filter(k=>typeof platform?.[k]!=='function');
  return {ok:missing.length===0,missing};
}
