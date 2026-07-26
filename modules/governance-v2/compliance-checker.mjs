export function evaluateCompliance(requirements=[],evidence={}){
  const results=requirements.map(requirement=>{
    const value=evidence[requirement.key];
    let passed=false;
    switch(requirement.operator||'exists'){
      case 'exists': passed=value!==undefined&&value!==null; break;
      case 'eq': passed=value===requirement.value; break;
      case 'gte': passed=value>=requirement.value; break;
      default: throw new Error(`unknown operator: ${requirement.operator}`);
    }
    return {
      id:requirement.id,
      passed,
      severity:requirement.severity||'medium',
      message:requirement.message||requirement.id
    };
  });
  return {
    compliant:results.every(result=>result.passed),
    results,
    failed:results.filter(result=>!result.passed)
  };
}
