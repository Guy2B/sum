'use strict';

(function initGraphMemory(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_GRAPH_MEMORY = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(root) {
  const STORAGE_KEY = 'sigma.knowledgeGraph.v8';

  function load() {
    try {
      if (!root.localStorage) return null;
      const raw = root.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('[Sigma Graph Memory] load failed', error);
      return null;
    }
  }

  function save(graph) {
    try {
      if (!root.localStorage) return false;
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(graph));
      return true;
    } catch (error) {
      console.warn('[Sigma Graph Memory] save failed', error);
      return false;
    }
  }

  function clear() {
    try {
      if (!root.localStorage) return false;
      root.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }

  return {
    version: '8.0.0',
    STORAGE_KEY,
    load,
    save,
    clear
  };
});
