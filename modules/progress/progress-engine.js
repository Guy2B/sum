'use strict';

function clamp(value, min = 0, max = 100) { return Math.max(min, Math.min(max, Number(value) || 0)); }

function createProgressRecord(input = {}) {
  if (!input.workspaceId || !input.goalId || !input.metric) throw new TypeError('workspaceId, goalId and metric are required');
  const measuredAt = input.measuredAt || new Date().toISOString();
  return { id: String(input.id || `progress_${Date.now().toString(36)}`), workspaceId: String(input.workspaceId), goalId: String(input.goalId), metric: String(input.metric), value: clamp(input.value), weight: clamp(input.weight ?? 1, 0, 100), confidence: clamp(input.confidence ?? 1, 0, 1), kind: input.kind || 'measured', evidence: Array.isArray(input.evidence) ? [...input.evidence] : [], measuredAt };
}

function assessProgress(records = []) {
  const normalized = records.map(createProgressRecord);
  if (!normalized.length) return { progress: 0, confidence: 0, trend: 'unknown', records: 0, basis: { declared: 0, measured: 0, estimated: 0 } };
  let weighted = 0;
  let weights = 0;
  let confidenceWeight = 0;
  const basis = { declared: 0, measured: 0, estimated: 0 };
  for (const record of normalized) {
    const effectiveWeight = record.weight * record.confidence;
    weighted += record.value * effectiveWeight;
    weights += effectiveWeight;
    confidenceWeight += record.confidence;
    basis[record.kind] = (basis[record.kind] || 0) + 1;
  }
  const ordered = normalized.slice().sort((a, b) => Date.parse(a.measuredAt) - Date.parse(b.measuredAt));
  const first = ordered[0]?.value ?? 0;
  const last = ordered.at(-1)?.value ?? 0;
  const trend = last > first + 2 ? 'improving' : last < first - 2 ? 'declining' : 'stable';
  return { progress: Number((weights ? weighted / weights : 0).toFixed(1)), confidence: Number((confidenceWeight / normalized.length).toFixed(2)), trend, records: normalized.length, basis };
}

function nextReview(assessment = {}, options = {}) {
  const now = Number(options.now || Date.now());
  const days = assessment.confidence < 0.5 ? 3 : assessment.trend === 'declining' ? 2 : assessment.progress >= 100 ? 30 : 7;
  return new Date(now + days * 86400000).toISOString();
}

module.exports = { createProgressRecord, assessProgress, nextReview };
