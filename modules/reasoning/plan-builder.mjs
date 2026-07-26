export function buildPlan(tasks=[],order=[]){
  const map=new Map(tasks.map(t=>[t.id,t]));
  return order.filter(id=>map.has(id)).map((id,index)=>({...map.get(id),sequence:index+1}));
}
