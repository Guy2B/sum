function readPath(value,path){
  return String(path).split('.').reduce((current,key)=>current?.[key],value);
}

export function evaluateConstraint(constraint,context={}){
  const actual=readPath(context,constraint.path);
  const expected=constraint.value;
  switch(constraint.operator){
    case 'eq': return actual===expected;
    case 'neq': return actual!==expected;
    case 'gt': return actual>expected;
    case 'gte': return actual>=expected;
    case 'lt': return actual<expected;
    case 'lte': return actual<=expected;
    case 'in': return Array.isArray(expected)&&expected.includes(actual);
    default: throw new Error(`unknown operator: ${constraint.operator}`);
  }
}

export function evaluateConstraints(constraints=[],context={}){
  const results=constraints.map(constraint=>({
    id:constraint.id||null,
    passed:evaluateConstraint(constraint,context),
    severity:constraint.severity||'hard'
  }));
  return {
    feasible:results.every(result=>result.passed||result.severity==='soft'),
    results,
    violations:results.filter(result=>!result.passed)
  };
}
