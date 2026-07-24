'use strict';

(function exposeEntityEngine(root) {
  const graphApi = root.SIGMA_KNOWLEDGE_GRAPH;
  const contextApi = root.SIGMA_GRAPH_CONTEXT;
  const memory = root.SIGMA_GRAPH_MEMORY;

  if (!graphApi) {
    console.error('[Sigma V8] Knowledge Graph core is not loaded.');
    return;
  }

  const facade = {
    version: '8.0.0',

    build(signals = [], options = {}) {
      const initial = options.persist === false
        ? {}
        : (memory?.load?.() || {});
      const graph = graphApi.build(signals, initial);
      if (options.persist !== false) memory?.save?.(graph);
      return graph;
    },

    enrich(decisions = [], graph, context = {}) {
      return contextApi?.enrichDecisions
        ? contextApi.enrichDecisions(decisions, graph, context)
        : decisions;
    },

    search(graph, query, options) {
      return graphApi.search(graph, query, options);
    },

    neighbors(graph, entityId, options) {
      return graphApi.neighbors(graph, entityId, options);
    },

    summarize(graph) {
      return graphApi.summarize(graph);
    },

    clearMemory() {
      return memory?.clear?.() || false;
    }
  };

  root.SIGMA_ENTITY_ENGINE = facade;
})(typeof globalThis !== 'undefined' ? globalThis : window);
