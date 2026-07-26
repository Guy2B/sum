export function createApiContract({name,version='v1',routes=[]}={}) {
  if(!name) throw new Error('api name is required');
  return {
    name,
    version,
    routes:routes.map(route=>({
      method:String(route.method||'GET').toUpperCase(),
      path:route.path,
      capability:route.capability||null,
      auth:route.auth!==false
    }))
  };
}
