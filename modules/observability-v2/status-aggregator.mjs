const rank={healthy:0,unknown:1,degraded:2,unhealthy:3};

export function aggregateStatus(components=[]){
  const normalized=components.map(component=>({
    name:component.name,
    status:component.status||'unknown'
  }));

  const status=normalized.reduce(
    (worst,item)=>rank[item.status]>rank[worst]?item.status:worst,
    'healthy'
  );

  return {
    status,
    components:normalized,
    counts:normalized.reduce((acc,item)=>{
      acc[item.status]=(acc[item.status]||0)+1;
      return acc;
    },{})
  };
}
