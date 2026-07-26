function readPath(value,path){
  return String(path).split('.').reduce((current,key)=>current?.[key],value);
}
export function evaluateCondition(condition,context={}){
  const left=readPath(context,condition.path);
  const right=condition.value;
  switch(condition.operator){
    case 'eq': return left===right;
    case 'neq': return left!==right;
    case 'gt': return left>right;
    case 'gte': return left>=right;
    case 'lt': return left<right;
    case 'lte': return left<=right;
    case 'contains': return Array.isArray(left)?left.includes(right):String(left??'').includes(String(right));
    case 'exists': return left!==undefined&&left!==null;
    default: throw new Error(`unknown operator: ${condition.operator}`);
  }
}
export function evaluateConditions(conditions=[],context={},mode='all'){
  const results=conditions.map(condition=>evaluateCondition(condition,context));
  return mode==='any'?results.some(Boolean):results.every(Boolean);
}
