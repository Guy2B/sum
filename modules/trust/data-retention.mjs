export function createRetentionPolicy({
  defaultDays = 90,
  bySource = {},
  preserveAudit = true,
} = {}) {
  return {
    defaultDays: Math.max(1, Number(defaultDays)),
    bySource: { ...bySource },
    preserveAudit: Boolean(preserveAudit),
  };
}

export function evaluateRetention(items = [], policy, now = new Date()) {
  const keep = [];
  const purge = [];
  for (const item of items) {
    if (policy.preserveAudit && item.type === 'audit') {
      keep.push(item);
      continue;
    }
    const days = Number(policy.bySource?.[item.source] || policy.defaultDays);
    const createdAt = new Date(item.createdAt || item.occurredAt || 0);
    const ageDays = (now - createdAt) / 86400000;
    (ageDays > days ? purge : keep).push(item);
  }
  return { keep, purge };
}
