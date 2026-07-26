export function createRateLimitGuard({
  limit = 60,
  windowMs = 60_000,
  now = () => Date.now(),
} = {}) {
  const buckets = new Map();

  return {
    consume(key, amount = 1) {
      const time = now();
      const current = buckets.get(key);
      const bucket = !current || time >= current.resetAt
        ? { used: 0, resetAt: time + windowMs }
        : current;

      if (bucket.used + amount > limit) {
        buckets.set(key, bucket);
        return {
          allowed: false,
          remaining: Math.max(0, limit - bucket.used),
          retryAfterMs: Math.max(0, bucket.resetAt - time),
        };
      }

      bucket.used += amount;
      buckets.set(key, bucket);
      return {
        allowed: true,
        remaining: Math.max(0, limit - bucket.used),
        retryAfterMs: 0,
      };
    },
  };
}
