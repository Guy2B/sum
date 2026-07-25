'use strict';

class RelationshipEngineV2 {
  constructor() { this.edges = new Map(); this.history = []; }
  static key(from, type, to) { return `${from}::${type}::${to}`; }
  upsert({ from, to, type, weight = 1, metadata = {}, at = new Date().toISOString() }) {
    for (const [name, value] of Object.entries({ from, to, type })) if (!value) throw new TypeError(`${name} is required`);
    const normalizedWeight = Math.max(0, Math.min(1, Number(weight)));
    if (!Number.isFinite(normalizedWeight)) throw new TypeError('weight must be finite');
    const key = RelationshipEngineV2.key(from, type, to);
    const previous = this.edges.get(key) || null;
    const edge = Object.freeze({ from, to, type, weight: normalizedWeight, metadata: { ...metadata }, createdAt: previous?.createdAt || at, updatedAt: at });
    this.edges.set(key, edge);
    this.history.push({ action: previous ? 'updated' : 'created', key, at, before: previous, after: edge });
    return edge;
  }
  remove(from, type, to, at = new Date().toISOString()) {
    const key = RelationshipEngineV2.key(from, type, to); const before = this.edges.get(key);
    if (!before) return false; this.edges.delete(key); this.history.push({ action: 'removed', key, at, before, after: null }); return true;
  }
  find({ from, to, type } = {}) { return [...this.edges.values()].filter(e => (!from || e.from === from) && (!to || e.to === to) && (!type || e.type === type)); }
  mergeEntity(sourceId, targetId, at = new Date().toISOString()) {
    const current = [...this.edges.values()]; current.forEach(e => { if (e.from === sourceId || e.to === sourceId) { this.remove(e.from,e.type,e.to,at); this.upsert({ ...e, from: e.from === sourceId ? targetId : e.from, to: e.to === sourceId ? targetId : e.to, at }); }});
  }
  getHistory() { return [...this.history]; }
}
module.exports = { RelationshipEngineV2 };
