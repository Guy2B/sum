export function createAdapterRegistry() {
  const adapters = new Map();

  return {
    register(connectorId, adapter) {
      if (!connectorId || typeof adapter?.fetchSignals !== 'function') {
        throw new Error('connectorId and adapter.fetchSignals are required');
      }
      adapters.set(connectorId, adapter);
      return adapter;
    },
    get(connectorId) {
      return adapters.get(connectorId) || null;
    },
    list() {
      return [...adapters.keys()];
    },
    remove(connectorId) {
      return adapters.delete(connectorId);
    },
  };
}
