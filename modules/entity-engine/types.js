'use strict';

(function initEntityTypes(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_ENTITY_TYPES = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory() {
  const TYPES = Object.freeze({
    PERSON: 'person',
    COMPANY: 'company',
    PROJECT: 'project',
    GOAL: 'goal',
    TASK: 'task',
    MEETING: 'meeting',
    DOCUMENT: 'document',
    CONVERSATION: 'conversation',
    IDEA: 'idea',
    DECISION: 'decision',
    MONEY: 'money',
    ACCOUNT: 'account',
    HABIT: 'habit',
    HEALTH: 'health',
    PLACE: 'place',
    EVENT: 'event',
    LEARNING: 'learning',
    ASSET: 'asset',
    TOPIC: 'topic'
  });

  const RELATIONS = Object.freeze({
    MENTIONS: 'mentions',
    RELATES_TO: 'relates_to',
    BELONGS_TO: 'belongs_to',
    INVOLVES: 'involves',
    WORKS_FOR: 'works_for',
    OWNS: 'owns',
    SUPPORTS: 'supports',
    BLOCKS: 'blocks',
    PRECEDES: 'precedes',
    GENERATED_FROM: 'generated_from',
    CORROBORATES: 'corroborates'
  });

  function canonical(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9@.+\s_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function slug(value) {
    return canonical(value)
      .replace(/[@.]+/g, '-')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function stableEntityId(type, value) {
    return `entity:${type}:${slug(value) || 'unknown'}`;
  }

  return {
    version: '8.0.0',
    TYPES,
    RELATIONS,
    canonical,
    slug,
    stableEntityId
  };
});
