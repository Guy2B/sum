const clone = (value) => structuredClone(value);

export class ApplicationStore {
  #collections = new Map();

  constructor(seed = {}) {
    for (const [name, records] of Object.entries(seed)) {
      this.#collections.set(name, new Map(records.map((record) => [record.id, clone(record)])));
    }
  }

  save(collection, record) {
    if (!collection || !record?.id) throw new Error('collection and record.id are required');
    if (!this.#collections.has(collection)) this.#collections.set(collection, new Map());
    const now = new Date().toISOString();
    const current = this.#collections.get(collection).get(record.id);
    const stored = { ...clone(current ?? {}), ...clone(record), createdAt: current?.createdAt ?? record.createdAt ?? now, updatedAt: now };
    this.#collections.get(collection).set(record.id, stored);
    return clone(stored);
  }

  get(collection, id) { return clone(this.#collections.get(collection)?.get(id) ?? null); }
  list(collection, predicate = () => true) {
    return [...(this.#collections.get(collection)?.values() ?? [])].filter(predicate).map(clone);
  }
  remove(collection, id) { return this.#collections.get(collection)?.delete(id) ?? false; }
  snapshot() { return Object.fromEntries([...this.#collections].map(([k,v]) => [k, [...v.values()].map(clone)])); }
}
