export function createShutdownManager() {
  const hooks = [];
  let shuttingDown = false;
  return {
    register(name, hook) {
      hooks.push({ name, hook });
    },
    async shutdown(reason = 'manual') {
      if (shuttingDown) return { alreadyRunning: true };
      shuttingDown = true;
      const results = [];
      for (const item of [...hooks].reverse()) {
        try {
          await item.hook(reason);
          results.push({ name: item.name, ok: true });
        } catch (error) {
          results.push({ name: item.name, ok: false, error: error.message });
        }
      }
      return { reason, results, ok: results.every(item => item.ok) };
    },
  };
}
