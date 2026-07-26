export function validateE2ESuite(result={}) {
 const failures=[]; if(result.total<1) failures.push('no scenarios'); if(result.failed>0) failures.push('scenario failures'); if(result.passed!==result.total) failures.push('incomplete pass');
 return {ok:failures.length===0,failures};
}
