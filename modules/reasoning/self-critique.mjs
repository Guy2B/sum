export function critiqueResponse({answer='',criteria=[]}={}){
  const issues=[];
  for(const criterion of criteria){
    const passed=criterion.test(answer);
    if(!passed) issues.push({id:criterion.id||criterion.name||'criterion',message:criterion.message||'criterion failed'});
  }
  return {ok:issues.length===0,issues};
}
