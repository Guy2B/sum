export const CONNECTOR_CAPABILITIES = Object.freeze([
  'read-signals',
  'read-calendar',
  'read-documents',
  'read-finance',
  'write-actions',
]);

export function validateConnectorDefinition(definition = {}) {
  const errors = [];
  if (!definition.id || !/^[a-z0-9-]+$/.test(definition.id)) errors.push('invalid connector id');
  if (!definition.name) errors.push('connector name missing');
  if (!definition.version) errors.push('connector version missing');
  if (!Array.isArray(definition.capabilities)) errors.push('capabilities missing');

  for (const capability of definition.capabilities || []) {
    if (!CONNECTOR_CAPABILITIES.includes(capability)) errors.push(`unsupported capability: ${capability}`);
  }

  return { ok: errors.length === 0, errors };
}

export function createConnectorDefinition(input = {}) {
  const definition = {
    id: String(input.id || '').toLowerCase(),
    name: String(input.name || ''),
    version: String(input.version || '1.0.0'),
    capabilities: [...new Set(input.capabilities || [])],
    authType: input.authType || 'none',
    scopes: [...new Set(input.scopes || [])],
    pollIntervalMinutes: Math.max(5, Number(input.pollIntervalMinutes || 15)),
    enabled: input.enabled ?? true,
  };
  const validation = validateConnectorDefinition(definition);
  if (!validation.ok) throw new Error(validation.errors.join('; '));
  return definition;
}
