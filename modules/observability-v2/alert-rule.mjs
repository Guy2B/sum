function readPath(value,path){
  return String(path).split('.').reduce((current,key)=>current?.[key],value);
}

export function evaluateAlertRule(rule,context={}){
  const actual=readPath(context,rule.path);
  const threshold=rule.threshold;

  let triggered=false;
  switch(rule.operator){
    case 'gt': triggered=actual>threshold; break;
    case 'gte': triggered=actual>=threshold; break;
    case 'lt': triggered=actual<threshold; break;
    case 'lte': triggered=actual<=threshold; break;
    case 'eq': triggered=actual===threshold; break;
    default: throw new Error(`unknown operator: ${rule.operator}`);
  }

  return {
    id:rule.id,
    triggered,
    severity:rule.severity||'warning',
    actual,
    threshold
  };
}
