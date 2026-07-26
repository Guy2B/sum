export function evaluateSafety({request,policies=[]}={}){
  const violations=[];
  for(const policy of policies){
    const result=policy.check(request);
    if(result===false||result?.allowed===false) violations.push({id:policy.id||'policy',reason:result?.reason||'blocked'});
  }
  return {allowed:violations.length===0,violations};
}
