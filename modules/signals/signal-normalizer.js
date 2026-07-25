import { createSignal } from './universal-signal-schema.js';
export function normalizeSignal(raw={}) {
  return createSignal({ ...raw, title: raw.title || raw.subject || raw.name || '', body: raw.body || raw.text || raw.description || '',
    sender: raw.sender || raw.from || raw.organization || null, dueAt: raw.dueAt || raw.deadline || raw.dateLimit || null });
}
