'use strict';
(() => {
  const TYPES = Object.freeze(['account','post','message','comment','metric','notification','scheduledPost']);
  const now = () => new Date().toISOString();
  const id = (prefix='social') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;
  const text = value => String(value ?? '').trim();
  const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;

  function create(type, input={}) {
    if (!TYPES.includes(type)) throw new TypeError(`Unsupported social entity: ${type}`);
    const base = {
      id: text(input.id) || id(type),
      type,
      provider: text(input.provider) || 'unknown',
      accountId: text(input.accountId),
      externalId: text(input.externalId),
      title: text(input.title),
      text: text(input.text || input.content),
      url: text(input.url || input.sourceUrl),
      status: text(input.status) || 'active',
      priority: text(input.priority) || 'normal',
      createdAt: input.createdAt || now(),
      updatedAt: now(),
      raw: input.raw || null
    };
    if (type === 'account') Object.assign(base, {
      displayName: text(input.displayName || input.title),
      username: text(input.username), avatar: text(input.avatar),
      connected: input.connected !== false,
      permissions: Array.isArray(input.permissions) ? [...input.permissions] : [],
      lastSyncAt: input.lastSyncAt || ''
    });
    if (type === 'metric') Object.assign(base, {
      name: text(input.name || input.title), value: number(input.value),
      unit: text(input.unit), period: text(input.period)
    });
    if (type === 'post' || type === 'comment' || type === 'message') Object.assign(base, {
      author: text(input.author), media: Array.isArray(input.media) ? [...input.media] : [],
      likes: number(input.likes), commentsCount: number(input.commentsCount), reach: number(input.reach)
    });
    return Object.freeze(base);
  }

  function normaliseProviderPayload(provider, payload={}) {
    const map = (key, type) => (Array.isArray(payload[key]) ? payload[key] : []).map(item => create(type, {...item, provider:item.provider || provider}));
    return Object.freeze({
      provider,
      accounts: map('accounts','account'), posts: map('posts','post'),
      messages: map('messages','message'), comments: map('comments','comment'),
      metrics: map('metrics','metric'), notifications: map('notifications','notification'),
      syncedAt: payload.syncedAt || now()
    });
  }

  window.SigmaSocialModel = Object.freeze({ version:'4.9.2', TYPES, create, normaliseProviderPayload });
})();
