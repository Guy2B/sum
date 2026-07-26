export function createPushIngress({ maxAgeMs = 24 * 60 * 60 * 1000 } = {}) {
  const seen = new Map();

  function cleanup(now) {
    for (const [key, time] of seen.entries()) {
      if (now - time > maxAgeMs) seen.delete(key);
    }
  }

  return {
    ingest(event, now = Date.now()) {
      cleanup(now);
      const key = String(event.id || event.deliveryId || '');
      if (!key) return { accepted: false, reason: 'missing event id' };
      if (seen.has(key)) return { accepted: false, duplicate: true };
      seen.set(key, now);
      return { accepted: true, event };
    },
    size() {
      return seen.size;
    },
  };
}
