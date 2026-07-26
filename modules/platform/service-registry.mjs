export function createServiceRegistry(){
  const services=new Map();
  return {
    register(service){
      if(!service?.id) throw new Error('service id is required');
      services.set(service.id,structuredClone(service));
      return structuredClone(service);
    },
    get(id){const value=services.get(id);return value?structuredClone(value):null;},
    list(){return [...services.values()].map(x=>structuredClone(x));},
    remove(id){return services.delete(id);}
  };
}
