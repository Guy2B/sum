export function revokeSubjectAccess({
  subject,
  consents = [],
  sessions = [],
  connectorDefinitions = [],
} = {}) {
  return {
    consents: consents.map(item =>
      item.subject === subject ? { ...item, status: 'revoked', revokedAt: new Date().toISOString() } : item
    ),
    sessions: sessions.map(item =>
      item.provider === subject ? { ...item, status: 'revoked', revokedAt: new Date().toISOString() } : item
    ),
    connectorDefinitions: connectorDefinitions.map(item =>
      item.id === subject ? { ...item, enabled: false } : item
    ),
  };
}
