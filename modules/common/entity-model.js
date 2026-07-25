'use strict';

const ENTITY_TYPES = new Set([
  'Person', 'Organization', 'Household', 'ChildProfile', 'Project', 'Goal',
  'Milestone', 'Task', 'Event', 'Document', 'Signal', 'Decision', 'Skill',
  'LearningResource', 'HealthMetric', 'JobOpportunity', 'Application',
  'Assessment', 'ProgressRecord', 'Recommendation', 'Evidence'
]);

const PRIVACY_LEVELS = new Set(['public', 'internal', 'private', 'sensitive', 'restricted']);

function text(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function confidence(value = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

function createEntity(type, input = {}) {
  if (!ENTITY_TYPES.has(type)) throw new TypeError(`unsupported entity type: ${type}`);
  if (!input.owner) throw new TypeError('owner is required');
  if (!input.source) throw new TypeError('source is required');

  const now = input.createdAt || new Date().toISOString();
  const privacyLevel = input.privacyLevel || 'private';
  if (!PRIVACY_LEVELS.has(privacyLevel)) throw new TypeError('invalid privacyLevel');

  return {
    id: text(input.id || `${type.toLowerCase()}_${Date.now().toString(36)}`, 160),
    type,
    owner: text(input.owner, 160),
    workspaceId: text(input.workspaceId, 160) || null,
    source: typeof input.source === 'string' ? { id: text(input.source, 300), type: 'unknown' } : { ...input.source },
    createdAt: now,
    updatedAt: input.updatedAt || now,
    confidence: confidence(input.confidence),
    privacyLevel,
    evidence: Array.isArray(input.evidence) ? [...new Set(input.evidence.map(String))] : [],
    relationships: Array.isArray(input.relationships) ? input.relationships.map((relationship) => ({ ...relationship })) : [],
    attributes: input.attributes && typeof input.attributes === 'object' ? { ...input.attributes } : {}
  };
}

function validateEntity(entity = {}) {
  const errors = [];
  if (!ENTITY_TYPES.has(entity.type)) errors.push('unsupported type');
  for (const field of ['id', 'owner', 'source', 'createdAt', 'updatedAt']) {
    if (!entity[field]) errors.push(`${field} is required`);
  }
  if (!PRIVACY_LEVELS.has(entity.privacyLevel)) errors.push('invalid privacyLevel');
  if (!Array.isArray(entity.evidence)) errors.push('evidence must be an array');
  if (!Array.isArray(entity.relationships)) errors.push('relationships must be an array');
  if (confidence(entity.confidence) !== entity.confidence) errors.push('confidence must be between 0 and 1');
  return { valid: errors.length === 0, errors };
}

function linkEntities(entity, relationship) {
  if (!entity || !relationship?.targetId || !relationship?.type) throw new TypeError('entity, relationship type and targetId are required');
  const key = `${relationship.type}:${relationship.targetId}`;
  const relationships = (entity.relationships || []).filter((item) => `${item.type}:${item.targetId}` !== key);
  relationships.push({ type: text(relationship.type, 120), targetId: text(relationship.targetId, 160), confidence: confidence(relationship.confidence), evidence: Array.isArray(relationship.evidence) ? [...relationship.evidence] : [] });
  return { ...entity, relationships, updatedAt: relationship.updatedAt || new Date().toISOString() };
}

module.exports = { ENTITY_TYPES, PRIVACY_LEVELS, createEntity, validateEntity, linkEntities };
