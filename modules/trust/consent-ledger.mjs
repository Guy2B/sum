export function createConsentLedger(initial = []) {
  const entries = [...initial];
  return {
    grant({ subject, capability, scope = 'default', expiresAt = null, actor = 'user' } = {}) {
      if (!subject || !capability) throw new Error('subject and capability are required');
      const entry = {
        id: `consent_${Date.now()}_${entries.length}`,
        subject, capability, scope, expiresAt, actor,
        status: 'granted',
        createdAt: new Date().toISOString(),
      };
      entries.push(entry);
      return entry;
    },
    revoke(id, actor = 'user') {
      const entry = entries.find(item => item.id === id);
      if (!entry) throw new Error('consent not found');
      entry.status = 'revoked';
      entry.revokedAt = new Date().toISOString();
      entry.revokedBy = actor;
      return entry;
    },
    active(now = new Date()) {
      return entries.filter(item =>
        item.status === 'granted' &&
        (!item.expiresAt || new Date(item.expiresAt) > now)
      );
    },
    snapshot() {
      return structuredClone(entries);
    },
  };
}
