'use strict';
class UnifiedConnectorFramework {
  constructor() { this.connectors = new Map(); }
  register(name, adapter) {
    if (!name || !adapter) throw new TypeError('name and adapter are required');
    for (const method of ['authenticate','sync','incrementalSync','normalize','healthCheck','disconnect']) if (typeof adapter[method] !== 'function') throw new TypeError(`adapter missing ${method}()`);
    this.connectors.set(name, adapter); return this;
  }
  get(name) { const adapter = this.connectors.get(name); if (!adapter) throw new Error(`unknown connector: ${name}`); return adapter; }
  async sync(name, context = {}) { const adapter=this.get(name); const raw=await adapter.sync(context); return adapter.normalize(raw,context); }
  async incrementalSync(name, cursor, context = {}) { const adapter=this.get(name); const raw=await adapter.incrementalSync(cursor,context); return adapter.normalize(raw,context); }
  async health() { return Object.fromEntries(await Promise.all([...this.connectors].map(async ([name,a])=>[name,await a.healthCheck()]))); }
}
module.exports = { UnifiedConnectorFramework };
