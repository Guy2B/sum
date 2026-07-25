export function normalizeEmail(message = {}) {
  if (!message.id) throw new Error('Email id is required');
  return {
    id: `email:${message.id}`,
    source: 'email',
    sourceId: message.id,
    sender: message.from ?? '',
    title: message.subject ?? '(sans objet)',
    body: message.body ?? message.snippet ?? '',
    occurredAt: message.date ?? null,
    provenance: { provider: message.provider ?? 'generic-email', sourceId: message.id }
  };
}
