export function evaluateToolUse({tool,action,risk=0},{allowedTools=[],blockedActions=[],approvalThreshold=.7}={}){
  if(!allowedTools.includes(tool)) return {allowed:false,approvalRequired:false,reason:'tool-not-allowed'};
  if(blockedActions.includes(action)) return {allowed:false,approvalRequired:false,reason:'action-blocked'};
  if(risk>=approvalThreshold) return {allowed:true,approvalRequired:true,reason:'high-risk'};
  return {allowed:true,approvalRequired:false,reason:'policy-pass'};
}
