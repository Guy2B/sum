'use strict';

const ENTITY_TYPES = Object.freeze([
  'Person','Organization','Household','Project','Goal','Task','Document',
  'Signal','Decision','Evidence','Recommendation','ProgressRecord'
]);
const PRIVACY_LEVELS = Object.freeze(['public','internal','confidential','restricted']);

function requireString(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${name} must be a non-empty string`);
  return value.trim();
}

function normalizeEvidence(evidence = []) {
  if (!Array.isArray(evidence)) throw new TypeError('evidence must be an array');
  return evidence.map((item, index) => ({
    id: requireString(item.id || `evidence-${index + 1}`, 'evidence.id'),
    source: requireString(item.source, 'evidence.source'),
    confidence: clamp(item.confidence ?? 1),
    observedAt: item.observedAt || null,
    payload: item.payload ?? null
  }));
}

function clamp(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError('confidence must be a finite number');
  return Math.max(0, Math.min(1, number));
}

function createCanonicalEntity(input) {
  if (!input || typeof input !== 'object') throw new TypeError('entity input is required');
  const type = requireString(input.type, 'type');
  if (!ENTITY_TYPES.includes(type)) throw new RangeError(`unsupported entity type: ${type}`);
  const now = new Date().toISOString();
  const privacyLevel = input.privacyLevel || 'internal';
  if (!PRIVACY_LEVELS.includes(privacyLevel)) throw new RangeError(`unsupported privacy level: ${privacyLevel}`);
  return Object.freeze({
    id: requireString(input.id, 'id'),
    type,
    owner: requireString(input.owner, 'owner'),
    workspaceId: requireString(input.workspaceId, 'workspaceId'),
    source: requireString(input.source, 'source'),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || input.createdAt || now,
    confidence: clamp(input.confidence ?? 1),
    privacyLevel,
    relationships: Array.isArray(input.relationships) ? [...input.relationships] : [],
    evidence: normalizeEvidence(input.evidence),
    attributes: Object.freeze({ ...(input.attributes || {}) })
  });
}

function validateCanonicalEntity(entity) {
  try { createCanonicalEntity(entity); return { valid: true, errors: [] }; }
  catch (error) { return { valid: false, errors: [error.message] }; }
}

module.exports = { ENTITY_TYPES, PRIVACY_LEVELS, createCanonicalEntity, validateCanonicalEntity };
