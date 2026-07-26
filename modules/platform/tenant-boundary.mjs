export function enforceTenantBoundary(resource,tenantId){
  if(!tenantId) throw new Error('tenantId is required');
  if(resource.tenantId!==tenantId) throw new Error('tenant-boundary-violation');
  return structuredClone(resource);
}
