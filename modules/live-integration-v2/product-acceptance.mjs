export function validateLiveIntegration(orchestrator){
  const required=['register','connect','sync','subscribe','view','diagnostics','raw'];
  const missing=required.filter(key=>typeof orchestrator?.[key]!=='function');
  return {ok:missing.length===0,missing};
}
