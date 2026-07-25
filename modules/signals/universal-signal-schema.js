const SOURCES = new Set(['email','sms','calendar','notification','document','bank','school','job','health','task','manual','other']);
export function createSignal(input={}) {
  const source = SOURCES.has(input.source) ? input.source : 'other';
  return { id: input.id || `sig-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, source,
    title: String(input.title || '').trim(), body: String(input.body || '').trim(), sender: input.sender || null,
    receivedAt: input.receivedAt || new Date().toISOString(), dueAt: input.dueAt || null,
    metadata: { ...(input.metadata || {}) } };
}
export { SOURCES };
