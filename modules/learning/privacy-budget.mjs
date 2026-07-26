export function createPrivacyBudget(limit = 100) {
  let used = 0;
  return {
    consume(amount, reason = 'learning') {
      const value = Math.max(0, Number(amount || 0));
      if (used + value > limit) return { allowed: false, remaining: limit - used, reason };
      used += value;
      return { allowed: true, remaining: limit - used, reason };
    },
    status() {
      return { limit, used, remaining: limit - used };
    },
  };
}
