function redact(value) {
  if (!value) return null;
  const text = String(value);
  return text.length <= 6 ? '******' : `${text.slice(0, 2)}***${text.slice(-2)}`;
}

export function storeCredentialReference({
  connectorId,
  secretRef,
  expiresAt = null,
  scopes = [],
} = {}) {
  if (!connectorId || !secretRef) throw new Error('connectorId and secretRef are required');
  if (/token|password|secret/i.test(secretRef) && !/^vault:|^env:|^keychain:/i.test(secretRef)) {
    throw new Error('raw credentials are forbidden; use a vault, environment or keychain reference');
  }
  return {
    connectorId,
    secretRef,
    displayRef: redact(secretRef),
    expiresAt,
    scopes: [...new Set(scopes)],
    storedAt: new Date().toISOString(),
  };
}

export function credentialStatus(record, now = new Date()) {
  if (!record) return 'missing';
  if (!record.expiresAt) return 'valid';
  return new Date(record.expiresAt) <= now ? 'expired' : 'valid';
}
