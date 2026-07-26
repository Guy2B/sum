export function reconcileChanges(existing = [], incoming = []) {
  const byId = new Map(existing.map(item => [item.externalId || item.id, item]));
  const created = [];
  const updated = [];

  for (const item of incoming) {
    const key = item.externalId || item.id;
    const previous = byId.get(key);
    if (!previous) {
      created.push(item);
      byId.set(key, item);
      continue;
    }
    const merged = { ...previous, ...item, metadata: { ...(previous.metadata || {}), ...(item.metadata || {}) } };
    if (JSON.stringify(merged) !== JSON.stringify(previous)) updated.push(merged);
    byId.set(key, merged);
  }

  return { items: [...byId.values()], created, updated };
}
