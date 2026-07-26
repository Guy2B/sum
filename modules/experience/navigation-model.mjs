export function createNavigationModel(items=[]){
  const normalized=items.map((item,index)=>({
    id:item.id,
    label:item.label,
    href:item.href||'#',
    order:Number.isFinite(item.order)?item.order:index,
    group:item.group||'default',
    visible:item.visible!==false
  }));
  return normalized.filter(x=>x.visible).sort((a,b)=>a.order-b.order);
}
