export function createModelVersion({
  name,
  parameters = {},
  parentVersion = null,
  metrics = {},
} = {}) {
  if (!name) throw new Error('name is required');
  return {
    id: `${name}_${Date.now()}`,
    name,
    parameters,
    parentVersion,
    metrics,
    createdAt: new Date().toISOString(),
  };
}

export function chooseBetterModel(current, candidate, metric = 'score') {
  return Number(candidate.metrics?.[metric] || 0) > Number(current.metrics?.[metric] || 0)
    ? candidate
    : current;
}
