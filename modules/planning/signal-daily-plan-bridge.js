export function injectSignalActions(plan=[], actions=[], limit=5) {
  const selected=[...actions].sort((a,b)=>rank(a.priority)-rank(b.priority)).slice(0,limit);
  const existing=new Set(plan.map(x=>x.sourceSignalId).filter(Boolean));
  return [...plan, ...selected.filter(a=>!existing.has(a.sourceSignalId)).map(a=>({...a,type:'signal-action',status:'proposed'}))];
}
function rank(p){return ({critical:0,high:1,medium:2,low:3})[p]??4;}
