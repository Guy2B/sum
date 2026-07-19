'use strict';
(() => {
  const STORAGE_KEY = 'sigma.social.v490';
  const TYPES = Object.freeze(['account','post','message','comment','metric','notification','scheduledPost']);

  const blank = () => ({
    schemaVersion: 1,
    accounts: [], posts: [], messages: [], comments: [], metrics: [], notifications: [], scheduledPosts: [],
    lastSyncAt: '', updatedAt: new Date().toISOString()
  });

  function safeParse(value) { try { return JSON.parse(value); } catch { return null; } }
  function loadLocal() { return safeParse(localStorage.getItem(STORAGE_KEY)) || blank(); }
  function saveLocal(data) {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('sigma:social-updated', { detail: data }));
    return data;
  }
  function uid(prefix='social') { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`; }
  function normalise(type, input={}) {
    if (!TYPES.includes(type)) throw new Error(`Unsupported social type: ${type}`);
    return Object.freeze({
      id: input.id || uid(type), type, provider: String(input.provider || 'unknown'),
      accountId: String(input.accountId || ''), externalId: String(input.externalId || ''),
      title: String(input.title || ''), text: String(input.text || input.content || ''),
      url: String(input.url || input.sourceUrl || ''), status: String(input.status || 'active'),
      createdAt: input.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(),
      raw: input.raw || null
    });
  }
  function collectionName(type) {
    return ({account:'accounts',post:'posts',message:'messages',comment:'comments',metric:'metrics',notification:'notifications',scheduledPost:'scheduledPosts'})[type];
  }
  function upsert(type, input) {
    const data = loadLocal(); const key = collectionName(type); const item = normalise(type, input);
    const idx = data[key].findIndex(x => x.id === item.id || (item.externalId && x.externalId === item.externalId && x.provider === item.provider));
    if (idx >= 0) data[key][idx] = item; else data[key].unshift(item);
    return saveLocal(data);
  }
  function remove(type, id) { const data=loadLocal(); const key=collectionName(type); data[key]=data[key].filter(x=>x.id!==id); return saveLocal(data); }
  function snapshot() { return structuredClone ? structuredClone(loadLocal()) : JSON.parse(JSON.stringify(loadLocal())); }
  function providerSummary(provider) {
    const d=loadLocal(); const count=k=>d[k].filter(x=>x.provider===provider).length;
    return { provider, accounts:count('accounts'), posts:count('posts'), messages:count('messages'), comments:count('comments'), notifications:count('notifications') };
  }
  function markSync() { const d=loadLocal(); d.lastSyncAt=new Date().toISOString(); return saveLocal(d); }

  window.SigmaSocialCore = Object.freeze({ version:'4.9.0', TYPES, snapshot, upsert, remove, providerSummary, markSync, reset:()=>saveLocal(blank()) });
})();
