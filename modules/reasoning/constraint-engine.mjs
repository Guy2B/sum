export function evaluateConstraints(option,constraints=[]){
  const results=constraints.map(c=>{
    try{return {id:c.id||'constraint',ok:Boolean(c.test(option)),severity:c.severity||'hard'};}
    catch(e){return {id:c.id||'constraint',ok:false,severity:c.severity||'hard',error:e.message};}
  });
  return {allowed:results.every(r=>r.ok||r.severity!=='hard'),results};
}
