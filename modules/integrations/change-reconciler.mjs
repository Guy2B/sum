export function reconcileChanges(local=[],remote=[]){
  const l=new Map(local.map(x=>[x.externalId,x])),r=new Map(remote.map(x=>[x.externalId,x]));
  const created=[],updated=[],deleted=[];
  for(const [id,item] of r){
    if(!l.has(id)) created.push(item);
    else if(JSON.stringify(l.get(id))!==JSON.stringify(item)) updated.push({before:l.get(id),after:item});
  }
  for(const [id,item] of l) if(!r.has(id)) deleted.push(item);
  return {created,updated,deleted};
}
