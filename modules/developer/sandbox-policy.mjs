export function evaluateSandboxPolicy(extension,{allowedCapabilities=[],blockedEntrypoints=[]}={}){
  const missing=(extension.capabilities||[]).filter(x=>!allowedCapabilities.includes(x));
  if(blockedEntrypoints.includes(extension.entrypoint)) return {allowed:false,reason:'blocked-entrypoint',missing};
  if(missing.length) return {allowed:false,reason:'capability-denied',missing};
  return {allowed:true,reason:'policy-pass',missing:[]};
}
