'use strict';
(() => {
  const PROVIDERS = {
    instagram: { name: 'Instagram', icon: 'IG', live: true, auth: 'meta', copy: 'instagramCopy', status: 'requiresApproval' },
    facebook: { name: 'Facebook Pages', icon: 'f', live: true, auth: 'meta', copy: 'facebookCopy', status: 'requiresApproval' },
    youtube: { name: 'YouTube', icon: '▶', live: true, auth: 'google', copy: 'youtubeCopy', status: 'professionalOnly' },
    x: { name: 'X', icon: 'X', live: true, auth: 'oauth-pkce', copy: 'xCopy', status: 'requiresApproval' },
    linkedin: { name: 'LinkedIn', icon: 'in', live: true, auth: 'oauth', copy: 'linkedinCopy', status: 'requiresApproval' },
    tiktok: { name: 'TikTok', icon: '♪', live: true, auth: 'oauth', copy: 'tiktokCopy', status: 'requiresApproval' }
  };

  function initSocial(ctx) {
    const list = document.getElementById('social-interaction-list');
    if (!list) return { render() {} };
    const accountList = document.getElementById('social-account-list');
    const accountFilter = document.getElementById('social-account-filter');
    const statusFilter = document.getElementById('social-status-filter');
    const connectDialog = document.getElementById('social-connect-dialog');
    const infoDialog = document.getElementById('social-info-dialog');
    const picker = document.getElementById('social-provider-picker');
    const API = String(window.SUM_CONFIG.socialApiBaseUrl || '').replace(/\/$/, '');
    let pendingProvider = '';

    function nowMinus(hours) { return new Date(Date.now() - hours * 3600000).toISOString(); }
    function tomorrow() { const date = new Date(); date.setDate(date.getDate() + 1); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
    function providerName(key) { return PROVIDERS[key]?.name || key; }
    function providerClass(key) { return `provider-${String(key).replace(/[^a-z0-9-]/gi, '')}`; }

    function demoInteractions(provider, accountId) {
      const common = [
        { id: ctx.uid(), accountId, provider, type: 'message', title: ctx.t('social.demoLead'), content: ctx.t('social.demoLeadCopy'), sender: 'Nadia Martin', receivedAt: nowMinus(3), unread: true, requiresReply: true, priority: 92, contentIdea: false, handled: false, sourceUrl: '' },
        { id: ctx.uid(), accountId, provider, type: 'comment', title: ctx.t('social.demoComment'), content: ctx.t('social.demoCommentCopy'), sender: 'Alex Studio', receivedAt: nowMinus(15), unread: true, requiresReply: true, priority: 74, contentIdea: false, handled: false, sourceUrl: '' },
        { id: ctx.uid(), accountId, provider, type: 'mention', title: ctx.t('social.demoIdea'), content: ctx.t('social.demoIdeaCopy'), sender: 'Audience signal', receivedAt: nowMinus(28), unread: false, requiresReply: false, priority: 58, contentIdea: true, handled: false, sourceUrl: '' }
      ];
      if (provider === 'youtube') common[0].type = 'comment';
      return common;
    }

    function score(item) {
      const text = `${item.title || ''} ${item.content || ''}`.toLowerCase();
      const urgent = ['urgent', 'price', 'pricing', 'tarif', 'devis', 'quote', 'deadline', 'rendez-vous', 'appointment', 'facture', 'invoice', 'problem', 'problème', 'hilfe', 'dringend', 'precio', 'presupuesto'];
      const question = /\?|could you|can you|pouvez-vous|peux-tu|können sie|puedes|podrías/.test(text);
      const ageHours = Math.max(0, (Date.now() - new Date(item.receivedAt || Date.now()).getTime()) / 3600000);
      const base = Number(item.priority || 35);
      return Math.min(100, Math.round(base + (urgent.some((word) => text.includes(word)) ? 22 : 0) + (question ? 12 : 0) + (ageHours > 24 && item.requiresReply ? 12 : 0)));
    }

    function normalise(item) {
      const priority = score(item);
      return { ...item, priority, requiresReply: Boolean(item.requiresReply || (priority >= 70 && /\?/.test(`${item.content || ''}`))) };
    }

    async function api(path, options = {}) {
      const response = await fetch(`${API}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
      if (!response.ok) throw new Error(`SOCIAL_${response.status}`);
      return response.json();
    }

    async function refreshRemote() {
      if (!API) return false;
      try {
        const [accounts, interactions] = await Promise.all([api('/api/social/accounts'), api('/api/social/interactions?limit=120')]);
        ctx.updateState((state) => {
          state.socialAccounts = accounts.accounts || [];
          state.socialInteractions = (interactions.interactions || []).map(normalise);
          state.socialSettings.lastSync = new Date().toISOString();
        });
        return true;
      } catch {
        ctx.toast(ctx.t('social.backendUnavailable'), 'error');
        return false;
      }
    }

    function connectDemo(provider) {
      const existing = ctx.getState().socialAccounts.find((account) => account.provider === provider);
      if (existing) return ctx.toast(ctx.t('social.alreadyConnected'), 'error');
      const id = ctx.uid();
      ctx.updateState((state) => {
        state.socialAccounts.push({ id, provider, label: `${providerName(provider)} Demo`, status: 'connected', demo: true, createdAt: new Date().toISOString() });
        state.socialInteractions.unshift(...demoInteractions(provider, id));
        state.socialSettings.lastSync = new Date().toISOString();
      });
      ctx.toast(ctx.t('social.demoConnected', { provider: providerName(provider) }));
      connectDialog.close();
      infoDialog.close();
    }

    function openProvider(provider) {
      pendingProvider = provider;
      const item = PROVIDERS[provider];
      if (!item) return;
      if (item.live && API) {
        location.href = `${API}/api/social/connect/${provider}`;
        return;
      }
      if (item.live && !API) {
        connectDemo(provider);
        return;
      }
      document.getElementById('social-info-icon').textContent = item.icon;
      document.getElementById('social-info-title').textContent = item.name;
      document.getElementById('social-info-copy').textContent = ctx.t(`social.${item.copy}`);
      document.getElementById('social-info-status').textContent = ctx.t(`social.${item.status}`);
      infoDialog.showModal();
    }

    function renderProviderPicker() {
      picker.innerHTML = Object.entries(PROVIDERS).map(([key, item]) => `<button class="social-provider-option ${providerClass(key)}" type="button" data-social-provider="${key}"><span>${item.icon}</span><div><strong>${item.name}</strong><small>${ctx.t(`social.${item.copy}`)}</small></div><b>${item.live ? '→' : 'i'}</b></button>`).join('');
    }

    function counts() {
      const rows = ctx.getState().socialInteractions.map(normalise).filter((item) => !item.handled);
      return {
        accounts: ctx.getState().socialAccounts.length,
        priority: rows.filter((item) => item.priority >= 70).length,
        replies: rows.filter((item) => item.requiresReply).length,
        comments: rows.filter((item) => item.type === 'comment').length
      };
    }

    function filtered() {
      const account = accountFilter.value || 'all';
      const status = statusFilter.value || 'priority';
      return ctx.getState().socialInteractions.map(normalise).filter((item) => {
        if (item.handled) return false;
        if (account !== 'all' && item.accountId !== account) return false;
        if (status === 'priority') return item.priority >= 70;
        if (status === 'reply') return item.requiresReply;
        if (status === 'comments') return item.type === 'comment';
        if (status === 'content') return item.contentIdea;
        return true;
      }).sort((a, b) => b.priority - a.priority || String(b.receivedAt).localeCompare(String(a.receivedAt)));
    }

    function renderAccounts() {
      const accounts = ctx.getState().socialAccounts;
      accountList.innerHTML = accounts.length ? accounts.map((account) => `<div class="social-account-chip ${providerClass(account.provider)}"><span>${PROVIDERS[account.provider]?.icon || '@'}</span><div><strong>${ctx.escape(account.label || providerName(account.provider))}</strong><small>${providerName(account.provider)} · ${account.demo ? ctx.t('social.demoMode') : ctx.t('social.connected')}</small></div><button class="icon-button danger" type="button" data-social-disconnect="${account.id}" aria-label="Disconnect">×</button></div>`).join('') : `<div class="social-empty-connection"><p>${ctx.t('social.noAccounts')}</p><button class="button secondary small" type="button" data-social-open-connect>${ctx.t('social.addAccount')}</button></div>`;
      const current = accountFilter.value;
      accountFilter.innerHTML = `<option value="all">${ctx.t('social.allAccounts')}</option>` + accounts.map((account) => `<option value="${account.id}">${ctx.escape(account.label || providerName(account.provider))}</option>`).join('');
      if ([...accountFilter.options].some((option) => option.value === current)) accountFilter.value = current;
      document.getElementById('social-mode-label').textContent = API ? 'CONNECTED' : 'DEMO';
    }

    function typeLabel(type) { return ctx.t(`social.${type === 'message' ? 'message' : type === 'comment' ? 'comment' : 'mention'}`); }
    function renderInteractions() {
      const rows = filtered();
      list.innerHTML = rows.length ? rows.map((item) => `<article class="social-interaction ${providerClass(item.provider)}"><div class="social-source-mark">${PROVIDERS[item.provider]?.icon || '@'}</div><div class="social-interaction-main"><div class="social-interaction-top"><div><span class="social-type">${typeLabel(item.type)}</span><strong>${ctx.escape(item.title || '')}</strong></div><time>${ctx.formatDateTime(item.receivedAt)}</time></div><span class="social-sender">${ctx.escape(item.sender || providerName(item.provider))}</span><p>${ctx.escape(item.content || '')}</p><div class="social-tags"><span class="priority-${item.priority >= 85 ? 'high' : item.priority >= 65 ? 'medium' : 'low'}">${ctx.t('social.priority')} ${item.priority}</span>${item.requiresReply ? `<span>${ctx.t('social.replySuggested')}</span>` : ''}${item.contentIdea ? `<span>${ctx.t('social.contentIdea')}</span>` : ''}</div></div><div class="social-interaction-actions"><button class="button secondary small" type="button" data-social-task="${item.id}">${ctx.t('social.createTask')}</button><button class="text-button" type="button" data-social-remind="${item.id}">${ctx.t('social.remind')}</button><button class="icon-button" type="button" data-social-resolve="${item.id}" title="${ctx.t('social.markHandled')}">✓</button>${item.sourceUrl ? `<a class="icon-button" href="${ctx.escape(item.sourceUrl)}" target="_blank" rel="noopener" title="${ctx.t('social.openSource')}">↗</a>` : ''}</div></article>`).join('') : `<div class="empty-state">${ctx.t('social.noInteractions')}</div>`;
    }

    function renderDashboard() {
      const c = counts();
      ['accounts', 'priority', 'replies', 'comments'].forEach((key) => {
        const el = document.getElementById(`social-kpi-${key}`);
        if (el) el.textContent = c[key];
      });
      const nav = document.getElementById('social-nav-count');
      if (nav) { nav.textContent = c.priority; nav.hidden = !c.priority; }
      const ids = { priority: 'dashboard-social-priority', replies: 'dashboard-social-replies', comments: 'dashboard-social-comments' };
      Object.entries(ids).forEach(([key, id]) => { const el = document.getElementById(id); if (el) el.textContent = c[key]; });
      const copy = document.getElementById('dashboard-social-copy');
      if (copy) copy.textContent = c.accounts ? ctx.t('social.dashboardCopy', c) : ctx.t('social.dashboardEmpty');
    }

    function render() {
      renderProviderPicker();
      renderAccounts();
      renderInteractions();
      renderDashboard();
    }

    document.getElementById('social-add-account').addEventListener('click', () => connectDialog.showModal());
    document.getElementById('social-connect-close').addEventListener('click', () => connectDialog.close());
    document.getElementById('social-info-close').addEventListener('click', () => infoDialog.close());
    document.getElementById('social-info-demo').addEventListener('click', () => pendingProvider && connectDemo(pendingProvider));
    picker.addEventListener('click', (event) => { const button = event.target.closest('[data-social-provider]'); if (button) openProvider(button.dataset.socialProvider); });
    accountList.addEventListener('click', async (event) => {
      if (event.target.closest('[data-social-open-connect]')) return connectDialog.showModal();
      const button = event.target.closest('[data-social-disconnect]');
      if (!button) return;
      const account = ctx.getState().socialAccounts.find((item) => item.id === button.dataset.socialDisconnect);
      if (API && account && !account.demo) {
        try { await api(`/api/social/accounts/${encodeURIComponent(account.id)}`, { method: 'DELETE' }); }
        catch { return ctx.toast(ctx.t('common.error'), 'error'); }
      }
      ctx.updateState((state) => {
        state.socialAccounts = state.socialAccounts.filter((item) => item.id !== button.dataset.socialDisconnect);
        state.socialInteractions = state.socialInteractions.filter((item) => item.accountId !== button.dataset.socialDisconnect);
      });
    });
    list.addEventListener('click', (event) => {
      const task = event.target.closest('[data-social-task]');
      if (task) {
        const item = ctx.getState().socialInteractions.find((row) => row.id === task.dataset.socialTask);
        if (item) {
          ctx.updateState((state) => state.tasks.unshift({ id: ctx.uid(), title: item.title || item.content.slice(0, 80), category: 'Communication', priority: item.priority >= 80 ? 'high' : 'medium', important: item.priority >= 65, urgent: item.priority >= 85, estimate: 20, dueDate: ctx.today(), done: false, createdAt: new Date().toISOString(), source: { type: 'social', id: item.id, provider: item.provider } }));
          ctx.toast(ctx.t('social.taskCreated'));
        }
      }
      const reminder = event.target.closest('[data-social-remind]');
      if (reminder) {
        const item = ctx.getState().socialInteractions.find((row) => row.id === reminder.dataset.socialRemind);
        if (item) {
          ctx.updateState((state) => state.tasks.unshift({ id: ctx.uid(), title: `${ctx.t('social.replyNeeded')}: ${item.title}`, category: 'Communication', priority: 'medium', important: true, urgent: false, estimate: 15, dueDate: tomorrow(), done: false, createdAt: new Date().toISOString(), source: { type: 'social-reminder', id: item.id, provider: item.provider } }));
          ctx.toast(ctx.t('social.reminderCreated'));
        }
      }
      const resolve = event.target.closest('[data-social-resolve]');
      if (resolve) ctx.updateState((state) => { const item = state.socialInteractions.find((row) => row.id === resolve.dataset.socialResolve); if (item) item.handled = true; });
    });
    accountFilter.addEventListener('change', renderInteractions);
    statusFilter.addEventListener('change', renderInteractions);
    document.getElementById('social-sync').addEventListener('click', async () => {
      if (API) await refreshRemote();
      else ctx.updateState((state) => { state.socialSettings.lastSync = new Date().toISOString(); });
      ctx.toast(ctx.t('social.synced'));
    });

    ctx.subscribe(render);
    document.addEventListener('languagechange', render);
    render();
    if (API) refreshRemote();
    return { render, refreshRemote };
  }

  window.SUM_MODULES = window.SUM_MODULES || {};
  window.SUM_MODULES.initSocial = initSocial;
})();
