export function createCheckpointStore(initial = {}) {
  const state = new Map(Object.entries(initial));

  return {
    get(connectorId) {
      return state.get(connectorId) || null;
    },
    set(connectorId, checkpoint) {
      const value = {
        ...checkpoint,
        connectorId,
        updatedAt: new Date().toISOString(),
      };
      state.set(connectorId, value);
      return value;
    },
    clear(connectorId) {
      return state.delete(connectorId);
    },
    snapshot() {
      return Object.fromEntries(state.entries());
    },
  };
}
