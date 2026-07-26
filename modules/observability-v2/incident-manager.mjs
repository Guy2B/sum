export function createIncidentManager(){
  const incidents=new Map();
  return {
    open({id,title,severity='warning',source,context={}}={}){
      if(!id||!title) throw new Error('incident id and title are required');
      const incident={
        id,title,severity,source:source||null,status:'open',
        openedAt:new Date().toISOString(),
        context:structuredClone(context),
        timeline:[]
      };
      incidents.set(id,incident);
      return structuredClone(incident);
    },
    append(id,event){
      const incident=incidents.get(id);
      if(!incident) throw new Error('unknown incident');
      incident.timeline.push({timestamp:new Date().toISOString(),...structuredClone(event)});
      return structuredClone(incident);
    },
    resolve(id,resolution='resolved'){
      const incident=incidents.get(id);
      if(!incident) throw new Error('unknown incident');
      incident.status='resolved';
      incident.resolution=resolution;
      incident.resolvedAt=new Date().toISOString();
      return structuredClone(incident);
    },
    get(id){const item=incidents.get(id);return item?structuredClone(item):null;},
    list(){return [...incidents.values()].map(item=>structuredClone(item));}
  };
}
