'use strict';
// Sigma V4.11.1 — Social Inbox UX redesign.
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
    const searchInput = document.getElementById('social-search-input');
    const inboxSummary = document.getElementById('social-inbox-summary');
    const inboxStrip = document.getElementById('social-inbox-strip');
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

    function engineAccountToLegacy(account) {
      const profileUrl = account.provider === 'linkedin'
        ? 'https://www.linkedin.com/in/me/'
        : (account.url || '');
      return {
        id: account.id,
        provider: account.provider,
        label: account.displayName || account.title || providerName(account.provider),
        displayName: account.displayName || account.title || '',
        avatar: account.avatar || '',
        username: account.username || '',
        status: account.connected === false ? 'disconnected' : 'connected',
        connected: account.connected !== false,
        demo: false,
        sourceUrl: profileUrl,
        createdAt: account.createdAt || new Date().toISOString()
      };
    }

    function engineItemToLegacy(item, type) {
      return normalise({
        id: item.id,
        accountId: item.accountId || '',
        provider: item.provider,
        type,
        title: item.title || (type === 'message' ? 'Message LinkedIn' : type === 'comment' ? 'Commentaire LinkedIn' : 'Notification LinkedIn'),
        content: item.text || item.content || '',
        sender: item.author || item.sender || providerName(item.provider),
        receivedAt: item.createdAt || item.updatedAt || new Date().toISOString(),
        unread: item.status !== 'read',
        requiresReply: Boolean(item.requiresReply),
        priority: item.priority || 35,
        contentIdea: false,
        handled: ['done','handled','resolved'].includes(item.status),
        sourceUrl: item.url || item.sourceUrl || ''
      });
    }

    function hydrateFromSocialEngine() {
      const snapshot = window.SigmaSocialEngine?.snapshot?.() || window.SigmaSocialStorage?.load?.();
      if (!snapshot) return;
      const accounts = (snapshot.accounts || [])
        .filter((account) => account.connected !== false && !account.demo)
        .map(engineAccountToLegacy);
      const interactions = [
        ...(snapshot.messages || []).map((item) => engineItemToLegacy(item, 'message')),
        ...(snapshot.comments || []).map((item) => engineItemToLegacy(item, 'comment')),
        ...(snapshot.notifications || []).map((item) => engineItemToLegacy(item, 'mention'))
      ];
      ctx.updateState((state) => {
        const otherAccounts = state.socialAccounts.filter((account) => !accounts.some((fresh) => fresh.provider === account.provider));
        state.socialAccounts = [...accounts, ...otherAccounts.filter((account) => !account.demo)];
        const providerSet = new Set(accounts.map((account) => account.provider));
        const otherInteractions = state.socialInteractions.filter((item) => !providerSet.has(item.provider) && !item.demo);
        state.socialInteractions = [...interactions, ...otherInteractions];
        state.socialSettings.lastSync = snapshot.lastSyncAt || state.socialSettings.lastSync;
      });
    }

    async function refreshTikTokState() {
      if (!window.SigmaTikTok?.isConfigured?.()) return;
      try {
        await window.SigmaTikTok.restoreConnectedState?.();
        hydrateFromSocialEngine();
      } catch (error) {
        console.warn('[SigmaTikTok] state refresh skipped', error);
      }
    }

    async function refreshLinkedInState() {
      if (!window.SigmaLinkedIn?.isConfigured?.()) return;
      try {
        const status = await window.SigmaLinkedIn.status();
        if (status?.connected) await window.SigmaLinkedIn.sync();
        hydrateFromSocialEngine();
      } catch (error) {
        console.warn('[SigmaLinkedIn] state refresh skipped', error);
      }
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
      if ((provider === 'facebook' || provider === 'instagram') && window.SigmaMeta) {
        connectDialog.close();
        window.SigmaMeta.connect().catch((error) => {
          console.error('[SigmaMeta] connection failed', error);
          ctx.toast(error.message || ctx.t('common.error'), 'error');
        });
        return;
      }
      if (provider === 'linkedin' && window.SigmaLinkedIn) {
        connectDialog.close();
        window.SigmaLinkedIn.connect().catch((error) => {
          console.error('[SigmaLinkedIn] connection failed', error);
          ctx.toast(error.message || ctx.t('common.error'), 'error');
        });
        return;
      }
      if (provider === 'x' && window.SigmaX) {
        connectDialog.close();
        window.SigmaX.connect().catch((error) => {
          console.error('[SigmaX] connection failed', error);
          ctx.toast(error.message || ctx.t('common.error'), 'error');
        });
        return;
      }
      if (provider === 'tiktok' && window.SigmaTikTok) {
        connectDialog.close();
        window.SigmaTikTok.connect().catch((error) => {
          console.error('[SigmaTikTok] connection failed', error);
          ctx.toast(error.message || ctx.t('common.error'), 'error');
        });
        return;
      }
      if (item.live && !API) {
        document.getElementById('social-info-icon').textContent = item.icon;
        document.getElementById('social-info-title').textContent = item.name;
        document.getElementById('social-info-copy').textContent = ctx.t(`social.${item.copy}`);
        document.getElementById('social-info-status').textContent = ctx.t(`social.${item.status}`);
        infoDialog.showModal();
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

    function connectedAccounts() {
      const byKey = new Map();
      for (const account of ctx.getState().socialAccounts || []) {
        if (!account || account.connected === false || account.status === 'disconnected') continue;
        const key = `${account.provider || 'unknown'}:${account.id || account.externalId || account.username || account.label || 'default'}`;
        byKey.set(key, account);
      }
      return [...byKey.values()];
    }

    function accountInitials(account) {
      const value = String(account.displayName || account.label || providerName(account.provider) || '?').trim();
      const words = value.split(/\s+/).filter(Boolean);
      return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : value.slice(0, 2)).toUpperCase();
    }

    function counts() {
      const rows = ctx.getState().socialInteractions.map(normalise).filter((item) => !item.handled);
      return {
        accounts: connectedAccounts().length,
        priority: rows.filter((item) => item.priority >= 70).length,
        replies: rows.filter((item) => item.requiresReply).length,
        comments: rows.filter((item) => item.type === 'comment').length
      };
    }

    function filtered() {
      const account = accountFilter.value || 'all';
      const status = statusFilter.value || 'priority';
      const query = String(searchInput?.value || '').trim().toLowerCase();
      return ctx.getState().socialInteractions.map(normalise).filter((item) => {
        if (item.handled) return false;
        if (account !== 'all' && item.accountId !== account) return false;
        if (query) {
          const haystack = `${item.title || ''} ${item.content || ''} ${item.sender || ''} ${providerName(item.provider)}`.toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        if (status === 'priority') return item.priority >= 70;
        if (status === 'unread') return item.unread !== false;
        if (status === 'reply') return item.requiresReply;
        if (status === 'comments') return item.type === 'comment';
        if (status === 'content') return item.contentIdea;
        return true;
      }).sort((a, b) => b.priority - a.priority || Number(Boolean(b.unread)) - Number(Boolean(a.unread)) || String(b.receivedAt).localeCompare(String(a.receivedAt)));
    }

    function renderAccounts() {
      const accounts = connectedAccounts();
      accountList.innerHTML = accounts.length ? accounts.map((account) => `<div class="social-account-chip ${providerClass(account.provider)}"><span>${account.avatar ? `<img src="${ctx.escape(account.avatar)}" alt="" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><b hidden>${ctx.escape(accountInitials(account))}</b>` : `<b>${ctx.escape(accountInitials(account))}</b>`}</span><div><strong>${ctx.escape(account.label || providerName(account.provider))}</strong><small>${providerName(account.provider)} · ${account.demo ? ctx.t('social.demoMode') : ctx.t('social.connected')}</small></div>${account.provider === 'linkedin' ? `<a class="icon-button" href="https://www.linkedin.com/messaging/" target="_blank" rel="noopener" title="Ouvrir la messagerie LinkedIn">↗</a>` : ''}<button class="icon-button danger" type="button" data-social-disconnect="${account.id}" aria-label="Disconnect">×</button></div>`).join('') : `<div class="social-empty-connection"><p>${ctx.t('social.noAccounts')}</p><button class="button secondary small" type="button" data-social-open-connect>${ctx.t('social.addAccount')}</button></div>`;
      const current = accountFilter.value;
      accountFilter.innerHTML = `<option value="all">${ctx.t('social.allAccounts')}</option>` + accounts.map((account) => `<option value="${account.id}">${ctx.escape(account.label || providerName(account.provider))}</option>`).join('');
      if ([...accountFilter.options].some((option) => option.value === current)) accountFilter.value = current;
      document.getElementById('social-mode-label').textContent = API ? 'CONNECTED' : 'DEMO';
    }

    function typeLabel(type) { return ctx.t(`social.${type === 'message' ? 'message' : type === 'comment' ? 'comment' : 'mention'}`); }

    function renderInboxSummary() {
      const active = ctx.getState().socialInteractions.map(normalise).filter((item) => !item.handled);
      const unread = active.filter((item) => item.unread !== false).length;
      const replies = active.filter((item) => item.requiresReply).length;
      const priority = active.filter((item) => item.priority >= 70).length;
      if (inboxSummary) {
        inboxSummary.textContent = active.length
          ? `${active.length} interaction${active.length > 1 ? 's' : ''} · ${unread} non lue${unread > 1 ? 's' : ''} · ${replies} réponse${replies > 1 ? 's' : ''} attendue${replies > 1 ? 's' : ''}`
          : 'Aucune interaction disponible pour le moment.';
      }
      if (inboxStrip) {
        inboxStrip.innerHTML = [
          ['Prioritaires', priority, 'priority'],
          ['Non lus', unread, 'unread'],
          ['À répondre', replies, 'reply'],
          ['Total', active.length, 'all']
        ].map(([label, value, filter]) =>
          `<button type="button" class="social-inbox-pill ${statusFilter.value === filter ? 'active' : ''}" data-inbox-filter="${filter}" aria-pressed="${statusFilter.value === filter}"><span>${label}</span><strong>${value}</strong></button>`
        ).join('');
      }
    }

    function renderInteractions() {
      const rows = filtered();
      list.innerHTML = rows.length ? rows.map((item) => {
        const provider = providerName(item.provider);
        const content = ctx.escape(item.content || '');
        const canExpand = String(item.content || '').length > 190;
        const priorityClass = item.priority >= 85 ? 'high' : item.priority >= 65 ? 'medium' : 'low';
        return `<article class="social-interaction ${providerClass(item.provider)} ${item.unread !== false ? 'is-unread' : ''}" data-social-item="${item.id}">
          <div class="social-source-mark" aria-hidden="true">${PROVIDERS[item.provider]?.icon || '@'}</div>
          <div class="social-interaction-main">
            <div class="social-interaction-top">
              <div class="social-interaction-identity">
                <div class="social-interaction-meta">
                  <span class="social-provider-name">${ctx.escape(provider)}</span>
                  <span class="social-type">${typeLabel(item.type)}</span>
                  ${item.unread !== false ? '<span class="social-unread-label">Non lu</span>' : ''}
                </div>
                <strong>${ctx.escape(item.title || item.sender || provider)}</strong>
                <span class="social-sender">${ctx.escape(item.sender || provider)}</span>
              </div>
              <time>${ctx.formatDateTime(item.receivedAt)}</time>
            </div>
            <p class="social-message-copy">${content}</p>
            ${canExpand ? `<button class="social-expand-button" type="button" data-social-expand="${item.id}" aria-expanded="false">Afficher plus</button>` : ''}
            <footer class="social-interaction-footer">
              <div class="social-tags">
                <span class="priority-${priorityClass}">${item.priority >= 85 ? 'Urgent' : item.priority >= 65 ? 'Important' : 'Normal'}</span>
                ${item.requiresReply ? '<span>Réponse attendue</span>' : ''}
                ${item.contentIdea ? '<span>Idée de contenu</span>' : ''}
              </div>
              <div class="social-interaction-actions">
                ${item.unread !== false ? `<button class="social-action subtle" type="button" data-social-read="${item.id}">Marquer lu</button>` : ''}
                <button class="social-action" type="button" data-social-task="${item.id}">Créer une tâche</button>
                <button class="social-icon-action" type="button" data-social-remind="${item.id}" title="${ctx.t('social.remind')}" aria-label="${ctx.t('social.remind')}">◷</button>
                <button class="social-icon-action success" type="button" data-social-resolve="${item.id}" title="${ctx.t('social.markHandled')}" aria-label="${ctx.t('social.markHandled')}">✓</button>
                ${item.sourceUrl ? `<a class="social-icon-action" href="${ctx.escape(item.sourceUrl)}" target="_blank" rel="noopener" title="${ctx.t('social.openSource')}" aria-label="${ctx.t('social.openSource')}">↗</a>` : ''}
              </div>
            </footer>
          </div>
        </article>`;
      }).join('') : `<div class="empty-state">${ctx.t('social.noInteractions')}</div>`;
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
      renderInboxSummary();
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
      if (account?.provider === 'tiktok' && window.SigmaTikTok) {
        try { await window.SigmaTikTok.disconnect(); }
        catch { return ctx.toast(ctx.t('common.error'), 'error'); }
      } else if (account?.provider === 'linkedin' && window.SigmaLinkedIn) {
        try { await window.SigmaLinkedIn.disconnect(); }
        catch { return ctx.toast(ctx.t('common.error'), 'error'); }
      } else if (API && account && !account.demo) {
        try { await api(`/api/social/accounts/${encodeURIComponent(account.id)}`, { method: 'DELETE' }); }
        catch { return ctx.toast(ctx.t('common.error'), 'error'); }
      }
      ctx.updateState((state) => {
        state.socialAccounts = state.socialAccounts.filter((item) => item.id !== button.dataset.socialDisconnect);
        state.socialInteractions = state.socialInteractions.filter((item) => item.accountId !== button.dataset.socialDisconnect);
      });
    });
    list.addEventListener('click', (event) => {
      const expand = event.target.closest('[data-social-expand]');
      if (expand) {
        const card = expand.closest('.social-interaction');
        const expanded = card?.classList.toggle('is-expanded');
        expand.setAttribute('aria-expanded', String(Boolean(expanded)));
        expand.textContent = expanded ? 'Réduire' : 'Afficher plus';
        return;
      }
      const read = event.target.closest('[data-social-read]');
      if (read) {
        ctx.updateState((state) => {
          const item = state.socialInteractions.find((row) => row.id === read.dataset.socialRead);
          if (item) item.unread = false;
        });
        return;
      }
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
    accountFilter.addEventListener('change', render);
    statusFilter.addEventListener('change', render);
    searchInput?.addEventListener('input', renderInteractions);
    inboxStrip?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-inbox-filter]');
      if (!button) return;
      statusFilter.value = button.dataset.inboxFilter;
      render();
    });
    document.getElementById('social-sync').addEventListener('click', async () => {
      if (API) await refreshRemote();
      else {
        if (window.SigmaLinkedIn?.isConfigured?.()) {
          try {
            const status = await window.SigmaLinkedIn.status();
            if (status?.connected) await window.SigmaLinkedIn.sync();
          } catch (error) { console.warn('[SigmaLinkedIn] sync skipped', error.message); }
        }
        if (window.SigmaTikTok?.isConfigured?.()) {
          try { await window.SigmaTikTok.restoreConnectedState?.(); }
          catch (error) { console.warn('[SigmaTikTok] sync skipped', error.message); }
        }
        if (window.SigmaMeta) {
          try { await window.SigmaMeta.sync(); }
          catch (error) { console.warn('[SigmaMeta] sync skipped', error.message); }
        }
        hydrateFromSocialEngine();
        ctx.updateState((state) => { state.socialSettings.lastSync = new Date().toISOString(); });
      }
      ctx.toast(ctx.t('social.synced'));
    });

    ctx.subscribe(render);
    document.addEventListener('languagechange', render);
    window.addEventListener('sigma:social-engine-updated', hydrateFromSocialEngine);
    window.addEventListener('sigma:linkedin-connected', hydrateFromSocialEngine);
    window.addEventListener('sigma:linkedin-synced', hydrateFromSocialEngine);
    window.addEventListener('sigma:tiktok-connected', hydrateFromSocialEngine);
    window.addEventListener('sigma:tiktok-synced', hydrateFromSocialEngine);
    window.addEventListener('sigma:tiktok-disconnected', hydrateFromSocialEngine);
    window.addEventListener('hashchange', () => {
      if (location.hash === '#social') {
        refreshLinkedInState();
        refreshTikTokState();
      }
    });
    render();
    hydrateFromSocialEngine();
    refreshLinkedInState();
    refreshTikTokState();
    if (API) refreshRemote();
    return { render, refreshRemote, refreshLinkedInState, refreshTikTokState };
  }

  window.SUM_MODULES = window.SUM_MODULES || {};
  window.SUM_MODULES.initSocial = initSocial;
})();
