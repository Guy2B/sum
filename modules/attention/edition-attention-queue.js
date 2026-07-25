export function buildEditionAttentionQueue(projectedSignals, limit = 7) {
  return projectedSignals
    .filter(item => ['critical', 'high'].includes(item.priority))
    .slice(0, Math.max(0, limit))
    .map((item, index) => ({ ...item, position: index + 1, attentionKey: `${item.edition}:${item.domain}:${item.id}` }));
}
