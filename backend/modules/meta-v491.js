'use strict';
(() => {
  const cfg = () => window.SIGMA_SOCIAL_CONFIG?.providers?.meta || {};
  let functionsApi = null;
  let functionsInstance = null;

  async function ensureFunctions() {
    if (functionsApi && functionsInstance) return { api: functionsApi, instance: functionsInstance };
    if (!window.SigmaCloud?.configured || !window.SigmaCloud?.auth) {
      throw new Error('Connectez-vous d’abord à votre compte Sigma.');
    }
    functionsApi = await import('https://www.gstatic.com/firebasejs/11.1.0/firebase-functions.js');
    const region = window.SIGMA_SOCIAL_CONFIG?.firebaseFunctionsRegion || 'europe-west1';
    functionsInstance = functionsApi.getFunctions(window.SigmaCloud.auth.app, region);
    return { api: functionsApi, instance: functionsInstance };
  }

  async function call(name, payload = {}) {
    const { api, instance } = await ensureFunctions();
    const result = await api.httpsCallable(instance, name)(payload);
    return result.data || {};
  }

  function requireConfigured() {
    const meta = cfg();
    if (!meta.enabled) throw new Error('Le connecteur Meta est désactivé.');
    if (!meta.configured || !meta.appId || String(meta.appId).startsWith('REPLACE_')) {
      throw new Error('Ajoutez le Meta App ID dans social-config.js et déployez les Cloud Functions V4.9.1.');
    }
  }

  async function connect() {
    requireConfigured();
    const result = await call('metaCreateOAuthSession', { returnUrl: location.href.split('?')[0].split('#')[0] });
    if (!result.authUrl) throw new Error('URL OAuth Meta indisponible.');
    location.assign(result.authUrl);
  }

  function normaliseAndStore(data) {
    const core = window.SigmaSocialCore;
    if (!core) return data;
    (data.accounts || []).forEach(account => core.upsert('account', {
      id: `meta_${account.kind}_${account.id}`,
      provider: account.kind === 'instagram' ? 'instagram' : 'facebook',
      externalId: account.id,
      title: account.name || account.username || 'Compte Meta',
      status: 'connected',
      raw: account
    }));
    (data.posts || []).forEach(post => core.upsert('post', {
      id: `meta_post_${post.id}`,
      provider: post.provider,
      accountId: post.accountId,
      externalId: post.id,
      text: post.text || '',
      url: post.url || '',
      createdAt: post.createdAt,
      raw: post
    }));
    (data.comments || []).forEach(comment => core.upsert('comment', {
      id: `meta_comment_${comment.id}`,
      provider: comment.provider,
      accountId: comment.accountId,
      externalId: comment.id,
      text: comment.text || '',
      url: comment.url || '',
      createdAt: comment.createdAt,
      raw: comment
    }));
    core.markSync();
    return data;
  }

  async function sync() {
    requireConfigured();
    const data = await call('metaSync', {});
    normaliseAndStore(data);
    window.dispatchEvent(new CustomEvent('sigma:meta-synced', { detail: data }));
    return data;
  }

  async function disconnect() {
    const result = await call('metaDisconnect', {});
    window.dispatchEvent(new CustomEvent('sigma:meta-disconnected'));
    return result;
  }

  async function status() {
    try { return await call('metaStatus', {}); }
    catch { return { connected: false, configured: Boolean(cfg().configured) }; }
  }

  async function handleOAuthReturn() {
    const url = new URL(location.href);
    const state = url.searchParams.get('sigmaMeta');
    if (!state) return;
    const message = url.searchParams.get('message') || '';
    url.searchParams.delete('sigmaMeta');
    url.searchParams.delete('message');
    history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
    if (state === 'connected') {
      try {
        await sync();
        window.dispatchEvent(new CustomEvent('sigma:toast', { detail: { message: 'Facebook et Instagram sont connectés.', type: 'success' } }));
      } catch (error) { console.error('[SigmaMeta] sync after OAuth', error); }
    } else {
      console.error('[SigmaMeta] OAuth error:', message || state);
    }
  }

  window.SigmaMeta = Object.freeze({ version: '4.9.1', connect, sync, disconnect, status });
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', handleOAuthReturn, { once: true })
    : handleOAuthReturn();
})();
