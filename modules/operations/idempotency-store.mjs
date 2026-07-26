export function createIdempotencyStore({ ttlMs = 86400000 } = {}) {
  const entries = new Map();
  return {
    has(key, now = Date.now()) {
      const item = entries.get(key);
      if (!item) return false;
      if (now - item.createdAt > ttlMs) {
        entries.delete(key);
        return false;
      }
      return true;
    },
    set(key, value, now = Date.now()) {
      entries.set(key, { value, createdAt: now });
      return value;
    },
    get(key, now = Date.now()) {
      return this.has(key, now) ? entries.get(key).value : undefined;
    },
  };
}
