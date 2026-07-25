'use strict';

const SOURCE_WEIGHTS = Object.freeze({ user: 0.7, system: 0.75, document: 0.8, connector: 0.85, official: 0.95, measured: 1 });

function clamp(value) { return Math.max(0, Math.min(1, Number(value) || 0)); }

function createEvidence(input = {}) {
  if (!input.workspaceId || !input.subjectId || !input.claim) throw new TypeError('workspaceId, subjectId and claim are required');
  const now = input.observedAt || new Date().toISOString();
  return { id: String(input.id || `evidence_${Date.now().toString(36)}`), workspaceId: String(input.workspaceId), subjectId: String(input.subjectId), claim: String(input.claim).trim(), value: input.value ?? true, sourceId: input.sourceId ? String(input.sourceId) : null, sourceType: input.sourceType || 'user', observedAt: now, confidence: clamp(input.confidence ?? 1), contradicts: Array.isArray(input.contradicts) ? [...input.contradicts] : [], metadata: input.metadata && typeof input.metadata === 'object' ? { ...input.metadata } : {} };
}

function scoreEvidence(items = [], options = {}) {
  const evidence = items.map(createEvidence);
  if (!evidence.length) return { confidence: 0, support: 0, contradiction: 0, count: 0, rationale: ['no evidence'] };
  let support = 0;
  let contradiction = 0;
  for (const item of evidence) {
    const weight = clamp((SOURCE_WEIGHTS[item.sourceType] || 0.6) * item.confidence);
    if (item.value === false || item.metadata?.stance === 'contradict') contradiction += weight;
    else support += weight;
  }
  const total = support + contradiction;
  const diversity = new Set(evidence.map((item) => `${item.sourceType}:${item.sourceId || 'anonymous'}`)).size;
  const diversityBoost = Math.min(0.15, Math.max(0, diversity - 1) * 0.05);
  const confidence = total ? clamp((support / total) * (0.85 + diversityBoost)) : 0;
  const threshold = clamp(options.threshold ?? 0.65);
  return { confidence: Number(confidence.toFixed(3)), support: Number(support.toFixed(3)), contradiction: Number(contradiction.toFixed(3)), count: evidence.length, accepted: confidence >= threshold && support > contradiction, rationale: [`${evidence.length} evidence item(s)`, `${diversity} distinct source(s)`, contradiction ? 'contradictory evidence present' : 'no contradiction detected'] };
}

function explainClaim(claim, items, options) {
  const assessment = scoreEvidence(items, options);
  return { claim, ...assessment, certainty: assessment.confidence >= 0.85 ? 'high' : assessment.confidence >= 0.6 ? 'medium' : 'low' };
}

module.exports = { SOURCE_WEIGHTS, createEvidence, scoreEvidence, explainClaim };
