'use strict';

(function initEntityExtractor(root, factory) {
  const types = typeof module === 'object' && module.exports
    ? require('./types')
    : root.SIGMA_ENTITY_TYPES;
  const api = factory(types);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_ENTITY_EXTRACTOR = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(types) {
  const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  const URL_RE = /\bhttps?:\/\/[^\s)]+/gi;
  const PERSON_HINTS = /\b(with|from|to|call|meet|meeting|reply to|follow up with)\s+([A-Z][a-zÀ-ÿ'-]+(?:\s+[A-Z][a-zÀ-ÿ'-]+){0,2})/g;
  const PROJECT_HINTS = /\b(project|projet|initiative|workspace|repo|repository)\s+["“]?([A-Z0-9][A-Za-z0-9 _.-]{2,40})/gi;
  const COMPANY_HINTS = /\b(company|client|customer|vendor|supplier|organisation|organization|entreprise)\s+["“]?([A-Z][A-Za-z0-9 &.-]{2,40})/gi;
  const DOCUMENT_HINTS = /\b(contract|invoice|proposal|report|document|doc|brief|deck|presentation|facture|contrat|rapport)\b/gi;
  const MONEY_HINTS = /\b(?:€|\$|£)\s?\d[\d.,]*|\b\d[\d.,]*\s?(?:EUR|USD|GBP)\b/gi;

  function pushEntity(list, type, name, confidence, aliases = [], metadata = {}) {
    const clean = String(name || '').trim();
    if (!clean) return;
    list.push({
      type,
      name: clean,
      canonicalName: types.canonical(clean),
      aliases: [...new Set([clean, ...aliases].filter(Boolean))],
      confidence: Math.max(0, Math.min(1, Number(confidence || 0.5))),
      metadata
    });
  }

  function inferPrimaryType(signal = {}) {
    const sourceType = String(signal.sourceType || '').toLowerCase();
    const map = {
      task: types.TYPES.TASK,
      event: types.TYPES.EVENT,
      calendar: types.TYPES.MEETING,
      learning: types.TYPES.LEARNING,
      habit: types.TYPES.HABIT,
      health: types.TYPES.HEALTH,
      wellbeing: types.TYPES.HEALTH,
      money: types.TYPES.MONEY,
      finance: types.TYPES.MONEY,
      project: types.TYPES.PROJECT,
      social: types.TYPES.CONVERSATION,
      mail: types.TYPES.CONVERSATION,
      email: types.TYPES.CONVERSATION
    };
    return map[sourceType] || types.TYPES.TOPIC;
  }

  function extract(signal = {}) {
    const entities = [];
    const title = signal.title || signal.subject || '';
    const body = signal.body || signal.description || signal.snippet || '';
    const text = `${title}\n${body}`;
    const primaryType = inferPrimaryType(signal);

    pushEntity(
      entities,
      primaryType,
      title || signal.id || signal.sourceType || 'Untitled signal',
      0.96,
      [],
      { primary: true, sourceType: signal.sourceType }
    );

    const sender = signal.sender || signal.from || '';
    const senderEmail = (String(sender).match(EMAIL_RE) || [])[0];
    if (sender) {
      const displayName = String(sender)
        .replace(/<[^>]+>/g, '')
        .replace(EMAIL_RE, '')
        .trim();
      pushEntity(
        entities,
        types.TYPES.PERSON,
        displayName || senderEmail || sender,
        senderEmail ? 0.97 : 0.82,
        senderEmail ? [senderEmail] : [],
        { email: senderEmail || null, role: 'sender' }
      );

      if (senderEmail) {
        const senderDomain = senderEmail.split('@')[1];
        pushEntity(
          entities,
          types.TYPES.COMPANY,
          senderDomain,
          0.8,
          [senderDomain],
          { domain: senderDomain, extractedFrom: 'sender' }
        );
      }
    }

    for (const email of text.match(EMAIL_RE) || []) {
      const local = email.split('@')[0].replace(/[._-]+/g, ' ');
      pushEntity(
        entities,
        types.TYPES.PERSON,
        local,
        0.9,
        [email],
        { email, extractedFrom: 'text' }
      );
      const domain = email.split('@')[1];
      pushEntity(
        entities,
        types.TYPES.COMPANY,
        domain,
        0.72,
        [domain],
        { domain }
      );
    }

    for (const match of text.matchAll(PERSON_HINTS)) {
      pushEntity(entities, types.TYPES.PERSON, match[2], 0.72);
    }

    for (const match of text.matchAll(PROJECT_HINTS)) {
      pushEntity(entities, types.TYPES.PROJECT, match[2].trim(), 0.78);
    }

    for (const match of text.matchAll(COMPANY_HINTS)) {
      pushEntity(entities, types.TYPES.COMPANY, match[2].trim(), 0.74);
    }

    for (const keyword of text.match(DOCUMENT_HINTS) || []) {
      pushEntity(
        entities,
        types.TYPES.DOCUMENT,
        `${keyword}: ${title}`.slice(0, 90),
        0.66,
        [keyword]
      );
    }

    for (const amount of text.match(MONEY_HINTS) || []) {
      pushEntity(
        entities,
        types.TYPES.MONEY,
        amount,
        0.93,
        [],
        { amountText: amount }
      );
    }

    for (const url of text.match(URL_RE) || []) {
      pushEntity(
        entities,
        types.TYPES.ASSET,
        url,
        0.88,
        [],
        { url }
      );
    }

    if (Array.isArray(signal.entities)) {
      signal.entities.forEach((entity) => {
        if (typeof entity === 'string') {
          pushEntity(entities, types.TYPES.TOPIC, entity, 0.75);
        } else if (entity?.name) {
          pushEntity(
            entities,
            entity.type || types.TYPES.TOPIC,
            entity.name,
            entity.confidence || 0.8,
            entity.aliases || [],
            entity.metadata || {}
          );
        }
      });
    }

    return entities;
  }

  return {
    version: '8.0.0',
    inferPrimaryType,
    extract
  };
});
