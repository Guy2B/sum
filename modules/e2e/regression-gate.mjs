export function evaluateRegressionGate({testsPassed=0,testsFailed=0,coverage=0,utf8Clean=true}={}) {
  const reasons=[];
  if(testsFailed>0) reasons.push('tests failed');
  if(coverage<80) reasons.push('coverage below 80');
  if(!utf8Clean) reasons.push('UTF-8 regression');
  return {allowed:reasons.length===0,reasons,testsPassed};
}
