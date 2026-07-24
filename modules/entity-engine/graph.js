'use strict';

(function initKnowledgeGraph(root, factory) {
  const types = typeof module === 'object' && module.exports
    ? require('./types')
    : root.SIGMA_ENTITY_TYPES;
  const resolver = typeof module === 'object' && module.exports
    ? require('./resolver')
    : root.SIGMA_ENTITY_RESOLVER;
  const extractor = typeof module === 'object' && module.exports
    ? require('./extractor')
    : root.SIGMA_ENTITY_EXTRACTOR;
  const api = factory(types, resolver, extractor);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_KNOWLEDGE_GRAPH = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(types, resolver, extractor) {
  function createGraph(initial = {}) {
    return {
      version: '8.0.0',
      nodes: Array.isArray(initial.nodes) ? initial.nodes : [],
      edges: Array.isArray(initial.edges) ? initial.edges : [],
      signalEntityMap: initial.signalEntityMap || {},
      generatedAt: new Date().toISOString(),
      diagnostics: initial.diagnostics || {}
    };
  }

  function edgeId(from, relation, to) {
    return `edge:${types.slug(from)}:${relation}:${types.slug(to)}`;
  }

  function upsertEdge(graph, edge) {
    const id = edge.id || edgeId(edge.from, edge.relation, edge.to);
    const existing = graph.edges.find((item) => item.id === id);

    if (existing) {
      existing.confidence = Math.min(
        0.999,
        1 - (1 - Number(existing.confidence || 0.5)) *
            (1 - Number(edge.confidence || 0.5))
      );
      existing.evidences = [...new Set([
        ...(existing.evidences || []),
        ...(edge.evidences || [])
      ])];
      existing.updatedAt = new Date().toISOString();
      return existing;
    }

    const created = {
      id,
      from: edge.from,
      to: edge.to,
      relation: edge.relation || types.RELATIONS.RELATES_TO,
      confidence: Number(edge.confidence || 0.7),
      evidences: edge.evidences || [],
      metadata: edge.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    graph.edges.push(created);
    return created;
  }

  function ingestSignal(graph, signal) {
    const candidates = extractor.extract(signal).map((entity) => ({
      ...entity,
      evidences: [{
        signalId: signal.id,
        sourceType: signal.sourceType,
        provider: signal.provider || signal.provenance?.provider,
        observedAt:
          signal.provenance?.observedAt ||
          signal.receivedAt ||
          signal.createdAt ||
          signal.startAt ||
          null
      }]
    }));

    const beforeIds = new Set(graph.nodes.map((node) => node.id));
    graph.nodes = resolver.resolve(candidates, graph.nodes);

    const entityIds = [];
    candidates.forEach((candidate) => {
      const entity = graph.nodes.find((node) =>
        resolver.compatible(node, candidate)
      );
      if (entity) entityIds.push(entity.id);
    });

    graph.signalEntityMap[signal.id] = [...new Set(entityIds)];

    const primary = graph.nodes.find((node) =>
      entityIds.includes(node.id) && node.metadata?.primary
    ) || graph.nodes.find((node) => entityIds.includes(node.id));

    entityIds.forEach((entityId) => {
      if (!primary || entityId === primary.id) return;
      upsertEdge(graph, {
        from: primary.id,
        to: entityId,
        relation: types.RELATIONS.INVOLVES,
        confidence: 0.78,
        evidences: [signal.id]
      });
    });

    graph.generatedAt = new Date().toISOString();
    graph.diagnostics = {
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      signalCount: Object.keys(graph.signalEntityMap).length,
      newNodes: graph.nodes.filter((node) => !beforeIds.has(node.id)).length
    };

    return graph;
  }

  function build(signals = [], initial = {}) {
    const graph = createGraph(initial);
    signals.forEach((signal) => ingestSignal(graph, signal));
    return graph;
  }

  function getEntity(graph, id) {
    return graph.nodes.find((node) => node.id === id) || null;
  }

  function entitiesForSignal(graph, signalId) {
    const ids = graph.signalEntityMap[signalId] || [];
    return ids.map((id) => getEntity(graph, id)).filter(Boolean);
  }

  function neighbors(graph, entityId, options = {}) {
    const relation = options.relation;
    const edges = graph.edges.filter((edge) =>
      (edge.from === entityId || edge.to === entityId) &&
      (!relation || edge.relation === relation)
    );

    return edges.map((edge) => {
      const neighborId = edge.from === entityId ? edge.to : edge.from;
      return {
        entity: getEntity(graph, neighborId),
        edge
      };
    }).filter((item) => item.entity);
  }

  function search(graph, query, options = {}) {
    const needle = types.canonical(query);
    const type = options.type;
    return graph.nodes
      .filter((node) => !type || node.type === type)
      .map((node) => {
        const haystack = types.canonical([
          node.name,
          ...(node.aliases || [])
        ].join(' '));
        const exact = haystack === needle ? 1 : 0;
        const contains = haystack.includes(needle) ? 0.75 : 0;
        return {
          entity: node,
          relevance: exact || contains ||
            (needle && haystack.split(' ').some((part) => part.startsWith(needle))
              ? 0.5
              : 0)
        };
      })
      .filter((result) => result.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance ||
        b.entity.confidence - a.entity.confidence);
  }

  function summarize(graph) {
    const byType = graph.nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {});
    const byRelation = graph.edges.reduce((acc, edge) => {
      acc[edge.relation] = (acc[edge.relation] || 0) + 1;
      return acc;
    }, {});

    return {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      signals: Object.keys(graph.signalEntityMap).length,
      byType,
      byRelation
    };
  }

  return {
    version: '8.0.0',
    createGraph,
    ingestSignal,
    build,
    upsertEdge,
    getEntity,
    entitiesForSignal,
    neighbors,
    search,
    summarize
  };
});
