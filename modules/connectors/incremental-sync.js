"use strict";

class MemoryCursorStore {
  constructor() { this.values = new Map(); }
  async get(key) { return this.values.get(key) || null; }
  async set(key, value) { this.values.set(key, value); return value; }
  async delete(key) { return this.values.delete(key); }
}

class IncrementalSyncRunner {
  constructor({ cursorStore = new MemoryCursorStore(), maxPages = 100 }) {
    this.cursorStore = cursorStore;
    this.maxPages = maxPages;
  }

  async run({ connectorId, accountId = "default", fetchPage, onItems = async () => {} }) {
    if (typeof fetchPage !== "function") throw new TypeError("fetchPage must be a function.");
    const key = `${connectorId}:${accountId}`;
    let cursor = await this.cursorStore.get(key);
    let pages = 0;
    let itemsProcessed = 0;
    let finalCursor = cursor;

    while (pages < this.maxPages) {
      const page = await fetchPage({ cursor });
      const items = page.items || [];
      await onItems(items, { page: pages + 1, cursor });
      itemsProcessed += items.length;
      pages += 1;

      finalCursor = page.deltaCursor || page.nextCursor || finalCursor;
      if (!page.nextCursor) break;
      cursor = page.nextCursor;
    }

    if (pages >= this.maxPages) {
      throw new Error("Incremental sync exceeded maxPages.");
    }
    if (finalCursor) await this.cursorStore.set(key, finalCursor);

    return { connectorId, accountId, pages, itemsProcessed, cursor: finalCursor };
  }
}

module.exports = { MemoryCursorStore, IncrementalSyncRunner };
