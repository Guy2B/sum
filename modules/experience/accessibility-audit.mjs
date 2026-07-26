export function auditAccessibility(elements=[]){
  const issues=[];
  for(const element of elements){
    if(element.interactive&&!element.label)issues.push({id:element.id,issue:'missing-label'});
    if(element.image&&!element.alt)issues.push({id:element.id,issue:'missing-alt'});
    if(element.headingLevel&&element.headingLevel<1)issues.push({id:element.id,issue:'invalid-heading'});
  }
  return {ok:issues.length===0,issues};
}
