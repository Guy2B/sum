const WRITE_CAPABILITIES = new Set(['write-actions']);

export function createPermissionGrant(connector, requested = []) {
  const allowed = requested.filter(capability => connector.capabilities.includes(capability));
  return {
    connectorId: connector.id,
    granted: allowed.filter(capability => !WRITE_CAPABILITIES.has(capability)),
    pendingApproval: allowed.filter(capability => WRITE_CAPABILITIES.has(capability)),
    denied: requested.filter(capability => !connector.capabilities.includes(capability)),
    createdAt: new Date().toISOString(),
  };
}

export function approvePermission(grant, capability, actor = 'user') {
  if (!grant.pendingApproval.includes(capability)) {
    throw new Error(`Permission not pending: ${capability}`);
  }
  return {
    ...grant,
    granted: [...new Set([...grant.granted, capability])],
    pendingApproval: grant.pendingApproval.filter(item => item !== capability),
    history: [...(grant.history || []), { capability, actor, at: new Date().toISOString() }],
  };
}

export function hasPermission(grant, capability) {
  return Boolean(grant?.granted?.includes(capability));
}
