'use strict';

(function initGraphContext(root, factory) {
  const graphApi = typeof module === 'object' && module.exports
    ? require('./graph')
    : root.SIGMA_KNOWLEDGE_GRAPH;
  const api = factory(graphApi);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_GRAPH_CONTEXT = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(graphApi) {
  function entityImportance(entity, context = {}) {
    const importantPeople = new Set(
      (context.importantPeople || []).map((value) =>
        String(value).toLowerCase()
      )
    );
    const importantProjects = new Set(
      (context.importantProjects || []).map((value) =>
        String(value).toLowerCase()
      )
    );

    let score = 0;
    const name = String(entity.name || '').toLowerCase();

    if (entity.type === 'person' && importantPeople.has(name)) score += 12;
    if (entity.type === 'project' && importantProjects.has(name)) score += 12;
    if (entity.type === 'money') score += 4;
    if (entity.type === 'health') score += 5;
    if (entity.type === 'goal') score += 5;
    if ((entity.evidences || []).length >= 2) score += 4;
    if ((entity.evidences || []).length >= 4) score += 4;

    return score;
  }

  function enrichDecision(decision, graph, context = {}) {
    const entities = graphApi.entitiesForSignal(graph, decision.signalId);
    const boosts = entities.map((entity) => ({
      entityId: entity.id,
      entityType: entity.type,
      entityName: entity.name,
      boost: entityImportance(entity, context),
      confidence: entity.confidence,
      evidenceCount: (entity.evidences || []).length
    }));

    const graphBoost = Math.min(
      18,
      boosts.reduce((sum, item) => sum + item.boost, 0)
    );

    const topEntities = [...boosts]
      .sort((a, b) => b.boost - a.boost ||
        b.evidenceCount - a.evidenceCount)
      .slice(0, 5);

    return {
      ...decision,
      score: Math.min(100, Number(decision.score || 0) + graphBoost),
      knowledgeGraph: {
        entityIds: entities.map((entity) => entity.id),
        entities: topEntities,
        graphBoost,
        evidenceCount: entities.reduce(
          (sum, entity) => sum + (entity.evidences || []).length,
          0
        )
      }
    };
  }

  function enrichDecisions(decisions = [], graph, context = {}) {
    return decisions
      .map((decision) => enrichDecision(decision, graph, context))
      .sort((a, b) => b.score - a.score || b.confidence - a.confidence);
  }

  return {
    version: '8.0.0',
    entityImportance,
    enrichDecision,
    enrichDecisions
  };
});
