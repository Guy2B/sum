export function observePlatform({services=[],deployments=[],incidents=[]}={}){
  return {
    services:services.length,
    healthyServices:services.filter(x=>x.status==='healthy').length,
    deployments:deployments.length,
    activeIncidents:incidents.filter(x=>x.status!=='resolved').length,
    healthy:services.every(x=>x.status==='healthy')&&incidents.every(x=>x.status==='resolved')
  };
}
