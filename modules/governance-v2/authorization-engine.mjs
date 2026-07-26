function readPath(value,path){
  return String(path).split('.').reduce((current,key)=>current?.[key],value);
}

function matchesCondition(condition,context){
  const actual=readPath(context,condition.path);
  switch(condition.operator){
    case 'eq': return actual===condition.value;
    case 'neq': return actual!==condition.value;
    case 'in': return Array.isArray(condition.value)&&condition.value.includes(actual);
    case 'contains': return Array.isArray(actual)
      ? actual.includes(condition.value)
      : String(actual??'').includes(String(condition.value));
    case 'exists': return actual!==undefined&&actual!==null;
    default: throw new Error(`unknown operator: ${condition.operator}`);
  }
}

export function authorize({policies=[],identity,resource,action,context={}}={}){
  const evaluationContext={identity,resource,action,...structuredClone(context)};
  const matching=policies.filter(policy=>{
    const resourceMatch=policy.resource==='*'||policy.resource===resource;
    const actionMatch=policy.actions.length===0||policy.actions.includes('*')||policy.actions.includes(action);
    const conditionsMatch=(policy.conditions||[]).every(condition=>matchesCondition(condition,evaluationContext));
    return resourceMatch&&actionMatch&&conditionsMatch;
  });

  const denied=matching.find(policy=>policy.effect==='deny');
  if(denied) return {allowed:false,reason:'explicit-deny',policyId:denied.id};

  const allowed=matching.find(policy=>policy.effect==='allow');
  if(allowed) return {allowed:true,reason:'explicit-allow',policyId:allowed.id};

  return {allowed:false,reason:'default-deny',policyId:null};
}
