'use strict';
// Sigma V4.12.0 — Social Career Command Center.
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
    const commandTabs = [...document.querySelectorAll('[data-social-view]')];
    const commandPanels = [...document.querySelectorAll('[data-social-view-panel]')];
    const careerForm = document.getElementById('career-profile-form');
    const careerRefresh = document.getElementById('career-refresh');
    const careerJobList = document.getElementById('career-job-list');
    const careerFeedSummary = document.getElementById('career-feed-summary');
    const careerLinkedInState = document.getElementById('career-linkedin-state');
    const careerStatusRow = document.getElementById('career-status-row');
    const connectDialog = document.getElementById('social-connect-dialog');
    const infoDialog = document.getElementById('social-info-dialog');
    const picker = document.getElementById('social-provider-picker');
    const API = String(window.SUM_CONFIG.socialApiBaseUrl || '').replace(/\/$/, '');
    let pendingProvider = '';

    function nowMinus(hours) { return new Date(Date.now() - hours * 3600000).toISOString(); }
    function tomorrow() { const date = new Date(); date.setDate(date.getDate() + 1); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
    function providerName(key) { return PROVIDERS[key]?.name || key; }
    function providerClass(key) { return `provider-${String(key).replace(/[^a-z0-9-]/gi, '')}`; }


    const CAREER_STORAGE_KEY = 'sigma-career-profile-v1';
    const CAREER_CACHE_KEY = 'sigma-career-jobs-v1';
    const CAREER_API = 'https://www.arbeitnow.com/api/job-board-api';

    function readCareerProfile() {
      try {
        return { role: '', skills: '', location: '', remoteOnly: false, ...JSON.parse(localStorage.getItem(CAREER_STORAGE_KEY) || '{}') };
      } catch {
        return { role: '', skills: '', location: '', remoteOnly: false };
      }
    }

    function saveCareerProfile(profile) {
      localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(profile));
    }

    function careerTerms(profile) {
      return `${profile.role || ''} ${profile.skills || ''}`
        .toLowerCase()
        .split(/[,;/\n|]+|\s{2,}/)
        .map((term) => term.trim())
        .filter((term) => term.length > 1);
    }

    function stripHtml(value) {
      const node = document.createElement('div');
      node.innerHTML = String(value || '');
      return node.textContent || '';
    }

    function scoreCareerJob(job, profile) {
      const terms = careerTerms(profile);
      const haystack = `${job.title || ''} ${job.company_name || ''} ${(job.tags || []).join(' ')} ${stripHtml(job.description || '')}`.toLowerCase();
      let score = 18;
      terms.forEach((term, index) => {
        if (haystack.includes(term)) score += index === 0 ? 24 : 11;
      });
      const location = String(profile.location || '').trim().toLowerCase();
      if (location && String(job.location || '').toLowerCase().includes(location)) score += 15;
      if (profile.remoteOnly && job.remote) score += 18;
      if (profile.remoteOnly && !job.remote) score -= 12;
      const created = Number(job.created_at || 0) * 1000;
      const ageDays = created ? Math.max(0, (Date.now() - created) / 86400000) : 30;
      score += Math.max(0, 12 - Math.round(ageDays / 2));
      return Math.max(0, Math.min(100, score));
    }

    function careerMatchLabel(score) {
      if (score >= 75) return ['Très pertinent', 'excellent'];
      if (score >= 55) return ['Bon match', 'good'];
      return ['À explorer', 'possible'];
    }

    function formatCareerDate(timestamp) {
      const value = Number(timestamp || 0) * 1000;
      return value ? ctx.formatDateTime(new Date(value).toISOString()) : '';
    }

    function renderLinkedInCareerState() {
      if (!careerLinkedInState) return;
      const account = connectedAccounts().find((item) => item.provider === 'linkedin');
      if (!account) {
        careerLinkedInState.innerHTML = `<div class="career-provider-icon provider-linkedin">in</div><div><strong>LinkedIn non connecté</strong><span>Connectez le profil pour afficher votre identité professionnelle.</span></div>`;
        return;
      }
      careerLinkedInState.innerHTML = `<div class="career-provider-avatar">${account.avatar ? `<img src="${ctx.escape(account.avatar)}" alt="">` : accountInitials(account)}</div><div><strong>${ctx.escape(account.displayName || account.label || 'LinkedIn')}</strong><span><b>Profil connecté</b> · Feed LinkedIn non autorisé par les permissions actuelles</span></div>`;
    }

    function loadCareerForm() {
      if (!careerForm) return;
      const profile = readCareerProfile();
      careerForm.elements.role.value = profile.role || '';
      careerForm.elements.skills.value = profile.skills || '';
      careerForm.elements.location.value = profile.location || '';
      careerForm.elements.remoteOnly.checked = Boolean(profile.remoteOnly);
    }

    function renderCareerJobs(jobs, profile, fromCache = false) {
      if (!careerJobList) return;
      const ranked = (jobs || [])
        .map((job) => ({ ...job, sigmaScore: scoreCareerJob(job, profile) }))
        .filter((job) => job.sigmaScore >= 28)
        .sort((a, b) => b.sigmaScore - a.sigmaScore || Number(b.created_at || 0) - Number(a.created_at || 0))
        .slice(0, 18);

      if (careerFeedSummary) {
        careerFeedSummary.textContent = ranked.length
          ? `${ranked.length} opportunité${ranked.length > 1 ? 's' : ''} classée${ranked.length > 1 ? 's' : ''} selon votre profil${fromCache ? ' · données en cache' : ''}.`
          : 'Aucune offre suffisamment proche. Élargissez le poste ou les compétences.';
      }

      const excellent = ranked.filter((job) => job.sigmaScore >= 75).length;
      const remote = ranked.filter((job) => job.remote).length;
      if (careerStatusRow) {
        careerStatusRow.innerHTML = `<span><strong>${ranked.length}</strong> résultats</span><span><strong>${excellent}</strong> très pertinents</span><span><strong>${remote}</strong> remote</span>`;
      }

      careerJobList.innerHTML = ranked.length ? ranked.map((job) => {
        const [label, level] = careerMatchLabel(job.sigmaScore);
        const tags = (job.tags || []).slice(0, 4);
        const description = stripHtml(job.description || '').replace(/\s+/g, ' ').trim();
        return `<article class="career-job-card">
          <div class="career-job-score ${level}"><strong>${job.sigmaScore}%</strong><span>${label}</span></div>
          <div class="career-job-main">
            <div class="career-job-top">
              <div>
                <h4>${ctx.escape(job.title || 'Poste')}</h4>
                <p>${ctx.escape(job.company_name || 'Entreprise')} · ${ctx.escape(job.location || (job.remote ? 'Remote' : 'Localisation non précisée'))}</p>
              </div>
              <time>${formatCareerDate(job.created_at)}</time>
            </div>
            <p class="career-job-description">${ctx.escape(description.slice(0, 280))}${description.length > 280 ? '…' : ''}</p>
            <div class="career-job-footer">
              <div class="career-job-tags">${job.remote ? '<span>Remote</span>' : ''}${tags.map((tag) => `<span>${ctx.escape(tag)}</span>`).join('')}</div>
              <div class="career-job-actions">
                <button type="button" data-career-task="${ctx.escape(job.slug || job.url || job.title)}" data-career-title="${ctx.escape(job.title || 'Offre')}" data-career-company="${ctx.escape(job.company_name || '')}" data-career-url="${ctx.escape(job.url || '')}">Ajouter au plan</button>
                <a href="${ctx.escape(job.url || '#')}" target="_blank" rel="noopener">Voir l’offre ↗</a>
              </div>
            </div>
          </div>
        </article>`;
      }).join('') : '<div class="empty-state">Aucune opportunité correspondant aux critères actuels.</div>';
    }

    async function refreshCareerJobs(force = false) {
      if (!careerJobList) return;
      const profile = readCareerProfile();
      if (!profile.role && !profile.skills) {
        careerFeedSummary.textContent = 'Indiquez au moins un poste ou quelques compétences.';
        careerJobList.innerHTML = '<div class="career-empty-guide"><strong>Commencez par votre objectif professionnel</strong><p>Exemple : “Head of Sales” avec “SaaS, CRM, business development”.</p></div>';
        return;
      }

      if (!force) {
        try {
          const cached = JSON.parse(localStorage.getItem(CAREER_CACHE_KEY) || '{}');
          if (cached.savedAt && Date.now() - cached.savedAt < 30 * 60 * 1000 && Array.isArray(cached.jobs)) {
            renderCareerJobs(cached.jobs, profile, true);
            return;
          }
        } catch {}
      }

      careerRefresh.disabled = true;
      careerRefresh.textContent = 'Recherche…';
      careerJobList.innerHTML = '<div class="career-loading"><span></span><p>Analyse des offres disponibles…</p></div>';
      try {
        const response = await fetch(CAREER_API, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`CAREER_${response.status}`);
        const payload = await response.json();
        const jobs = Array.isArray(payload.data) ? payload.data : [];
        localStorage.setItem(CAREER_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), jobs }));
        renderCareerJobs(jobs, profile, false);
      } catch (error) {
        console.warn('[SigmaCareer] job feed unavailable', error);
        careerFeedSummary.textContent = 'Le flux d’offres est temporairement indisponible.';
        careerJobList.innerHTML = '<div class="career-empty-guide"><strong>Impossible de charger les offres</strong><p>Réessayez plus tard. La connexion LinkedIn reste active et n’est pas affectée.</p></div>';
      } finally {
        careerRefresh.disabled = false;
        careerRefresh.textContent = 'Actualiser';
      }
    }

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
      renderLinkedInCareerState();
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
    commandTabs.forEach((tab) => tab.addEventListener('click', () => {
      const view = tab.dataset.socialView;
      commandTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      commandPanels.forEach((panel) => {
        const active = panel.dataset.socialViewPanel === view;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
      if (view === 'career') {
        renderLinkedInCareerState();
        refreshCareerJobs(false);
      }
    }));

    careerForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(careerForm);
      saveCareerProfile({
        role: String(data.get('role') || '').trim(),
        skills: String(data.get('skills') || '').trim(),
        location: String(data.get('location') || '').trim(),
        remoteOnly: data.get('remoteOnly') === 'on'
      });
      localStorage.removeItem(CAREER_CACHE_KEY);
      refreshCareerJobs(true);
      ctx.toast('Profil professionnel mis à jour');
    });

    careerRefresh?.addEventListener('click', () => refreshCareerJobs(true));

    careerJobList?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-career-task]');
      if (!button) return;
      const title = `${button.dataset.careerTitle || 'Offre'} — ${button.dataset.careerCompany || ''}`.replace(/\s+—\s*$/, '');
      ctx.updateState((state) => {
        state.tasks.push({
          id: ctx.uid(),
          title,
          category: 'work',
          dueDate: tomorrow(),
          priority: 'medium',
          status: 'todo',
          notes: button.dataset.careerUrl || '',
          createdAt: new Date().toISOString()
        });
      });
      ctx.toast('Offre ajoutée au plan');
    });

    loadCareerForm();

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
