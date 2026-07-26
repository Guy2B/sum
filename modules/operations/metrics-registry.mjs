export function createMetricsRegistry() {
  const counters = new Map();
  const gauges = new Map();
  const timings = new Map();
  return {
    increment(name, value = 1) {
      counters.set(name, (counters.get(name) || 0) + value);
      return counters.get(name);
    },
    gauge(name, value) {
      gauges.set(name, Number(value));
      return gauges.get(name);
    },
    observe(name, milliseconds) {
      const values = timings.get(name) || [];
      values.push(Number(milliseconds));
      timings.set(name, values);
    },
    snapshot() {
      const timingSummary = {};
      for (const [name, values] of timings.entries()) {
        timingSummary[name] = {
          count: values.length,
          averageMs: values.reduce((a, b) => a + b, 0) / values.length,
          maxMs: Math.max(...values),
        };
      }
      return {
        counters: Object.fromEntries(counters),
        gauges: Object.fromEntries(gauges),
        timings: timingSummary,
      };
    },
  };
}
