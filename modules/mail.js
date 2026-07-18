'use strict';
(() => {
  const PROVIDERS = {
    gmail: { name: 'Gmail / Google Workspace', icon: 'G', mode: 'oauth' },
    outlook: { name: 'Outlook / Microsoft 365', icon: 'O', mode: 'oauth' },
    yahoo: { name: 'Yahoo Mail', icon: 'Y!', mode: 'app-password' },
    gmx: { name: 'GMX', icon: 'GMX', mode: 'app-password' }
  };

  function detectProvider(email = '') {
    const domain = String(email).trim().toLowerCase().split('@')[1] || '';
    if (!domain) return { provider: '', confidence: 0 };
    if (['gmail.com', 'googlemail.com'].includes(domain)) return { provider: 'gmail', confidence: 1 };
    if (/(^|\.)(outlook|hotmail|live|msn)\./.test(`.${domain}`) || domain.endsWith('.onmicrosoft.com')) return { provider: 'outlook', confidence: 1 };
    if (domain.includes('yahoo.')) return { provider: 'yahoo', confidence: 1 };
    if (domain === 'gmx.net' || domain === 'gmx.de' || domain === 'gmx.com' || domain.startsWith('gmx.')) return { provider: 'gmx', confidence: 1 };
    return { provider: '', confidence: .25, domain };
  }

  function initMail(ctx) {
    const form = document.getElementById('mail-unified-form');
    if (!form) return { render() {} };
    const emailInput = document.getElementById('mail-unified-email');
    const detection = document.getElementById('mail-detection');
    const providerChoices = document.getElementById('mail-provider-choice');
    const accountList = document.getElementById('mail-account-list');
    const messageList = document.getElementById('mail-message-list');
    const accountFilter = document.getElementById('mail-account-filter');
    const statusFilter = document.getElementById('mail-status-filter');
    const dialog = document.getElementById('mail-connect-dialog');
    const credentialForm = document.getElementById('mail-connect-form');
    const API = String(window.SUM_CONFIG.mailApiBaseUrl || '').replace(/\/$/, '');
    let selectedProvider = '';

    function nowMinus(hours) { return new Date(Date.now() - hours * 3600000).toISOString(); }
    function demoMessages(provider, accountId) {
      const name = PROVIDERS[provider]?.name || provider;
      return [
        { id: ctx.uid(), accountId, provider, subject: ctx.t('mail.demoUrgent'), sender: `client@${provider}.example`, snippet: ctx.t('mail.demoUrgentSnippet'), receivedAt: nowMinus(4), unread: true, importance: 'high', needsReply: true, sourceUrl: '' },
        { id: ctx.uid(), accountId, provider, subject: ctx.t('mail.demoInvoice'), sender: `billing@${provider}.example`, snippet: ctx.t('mail.demoInvoiceSnippet'), receivedAt: nowMinus(26), unread: true, importance: 'normal', needsReply: false, sourceUrl: '' },
        { id: ctx.uid(), accountId, provider, subject: `${name} · ${ctx.t('mail.demoNewsletter')}`, sender: `news@${provider}.example`, snippet: ctx.t('mail.demoNewsletterSnippet'), receivedAt: nowMinus(52), unread: false, importance: 'low', needsReply: false, sourceUrl: '' }
      ];
    }
    function heuristics(message) {
      const text = `${message.subject || ''} ${message.snippet || ''}`.toLowerCase();
      const importantWords = ['urgent','important','deadline','invoice','facture','paiement','payment','client','action required','réponse','antwort','respuesta','devis','quote','vertrag','contrato'];
      const replyWords = ['?','please reply','répondre','confirmation','confirm','feedback','avis','antwort','respuesta','disponibilité','availability'];
      const age = (Date.now() - new Date(message.receivedAt).getTime()) / 3600000;
      return { ...message, importance: message.importance === 'high' || importantWords.some((word) => text.includes(word)) ? 'high' : (message.importance || 'normal'), needsReply: Boolean(message.needsReply || (age > 18 && replyWords.some((word) => text.includes(word)))) };
    }
    async function api(path, options = {}) {
      const response = await fetch(`${API}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
      if (!response.ok) throw new Error(`MAIL_${response.status}`);
      return response.json();
    }
    async function refreshRemote() {
      if (!API) return false;
      try {
        const [accounts, messages] = await Promise.all([api('/api/mail/accounts'), api('/api/mail/messages?limit=100')]);
        ctx.updateState((state) => { state.mailAccounts = accounts.accounts || []; state.mailMessages = (messages.messages || []).map(heuristics); state.mailSettings.lastSync = new Date().toISOString(); });
        return true;
      } catch { ctx.toast(ctx.t('mail.backendUnavailable'), 'error'); return false; }
    }
    function connectDemo(provider, email = '') {
      const normalized = String(email || `${provider}.demo@local.test`).trim().toLowerCase();
      if (ctx.getState().mailAccounts.some((account) => account.email.toLowerCase() === normalized)) return ctx.toast(ctx.t('mail.alreadyConnected'), 'error');
      const accountId = ctx.uid();
      ctx.updateState((state) => {
        state.mailAccounts.push({ id: accountId, provider, email: normalized, status: 'connected', demo: true });
        state.mailMessages.unshift(...demoMessages(provider, accountId));
        state.mailSettings.lastSync = new Date().toISOString();
      });
      emailInput.value = '';
      selectedProvider = '';
      renderDetection();
      ctx.toast(ctx.t('mail.demoConnected', { provider: PROVIDERS[provider].name }));
    }
    function providerButton(provider) {
      const item = PROVIDERS[provider];
      return `<button type="button" data-mail-provider-choice="${provider}"><span>${item.icon}</span><strong>${ctx.escape(item.name)}</strong></button>`;
    }
    function renderDetection() {
      const email = emailInput.value.trim();
      const result = selectedProvider ? { provider: selectedProvider, confidence: 1 } : detectProvider(email);
      if (!email) {
        detection.innerHTML = `<span class="mail-detection-neutral">${ctx.t('mail.unifiedHint')}</span>`;
        providerChoices.hidden = true;
        return;
      }
      if (result.provider) {
        const item = PROVIDERS[result.provider];
        detection.innerHTML = `<span class="provider-mini">${item.icon}</span><span><strong>${ctx.escape(item.name)}</strong><small>${ctx.t(item.mode === 'oauth' ? 'mail.officialLogin' : 'mail.appPasswordGuided')}</small></span><b>✓</b>`;
        providerChoices.hidden = true;
      } else {
        detection.innerHTML = `<span class="mail-detection-neutral">${ctx.t('mail.customDomainDetected', { domain: result.domain || '' })}</span>`;
        providerChoices.innerHTML = providerButton('gmail') + providerButton('outlook') + providerButton('yahoo') + providerButton('gmx');
        providerChoices.hidden = false;
      }
    }
    async function startConnection(provider, email) {
      if (!provider) return ctx.toast(ctx.t('mail.chooseProvider'), 'error');
      if (!API && provider === 'gmail' && window.SigmaGoogle?.configured?.()) {
        try {
          const messages = await window.SigmaGoogle.importGmail();
          ctx.updateState((state) => {
            state.mailAccounts = (state.mailAccounts || []).filter((account) => account.provider !== 'gmail');
            state.mailAccounts.push({
              id: 'google-gmail',
              provider: 'gmail',
              email,
              label: 'Gmail',
              demo: false,
              status: 'connected',
              createdAt: new Date().toISOString()
            });

            const importedMessages = (messages || []).map(heuristics);
            state.mailMessages = (state.mailMessages || [])
              .filter((message) => message.provider !== 'gmail')
              .concat(importedMessages)
              .sort((a, b) => String(b.receivedAt || '').localeCompare(String(a.receivedAt || '')));

            state.mailSettings.lastSync = new Date().toISOString();
          });
          render();
          ctx.toast(ctx.t('mail.connected'));
          return;
        } catch (error) { ctx.toast(error.message, 'error'); return; }
      }
      if (!API) return connectDemo(provider, email);
      if (PROVIDERS[provider].mode === 'oauth') {
        location.href = `${API}/api/mail/connect/${provider}?email=${encodeURIComponent(email)}`;
        return;
      }
      credentialForm.reset();
      credentialForm.elements.provider.value = provider;
      credentialForm.elements.email.value = email;
      document.getElementById('mail-connect-title').textContent = `${ctx.t('mail.connect')} ${PROVIDERS[provider].name}`;
      document.getElementById('mail-connect-help').textContent = ctx.t(provider === 'yahoo' ? 'mail.yahooHelp' : 'mail.gmxHelp');
      document.getElementById('mail-connect-guide').innerHTML = `<ol><li>${ctx.t(`mail.${provider}Step1`)}</li><li>${ctx.t(`mail.${provider}Step2`)}</li><li>${ctx.t('mail.pasteAppPassword')}</li></ol>`;
      dialog.showModal();
    }
    function filteredMessages() {
      const account = accountFilter.value || 'all'; const status = statusFilter.value || 'all';
      return ctx.getState().mailMessages.map(heuristics).filter((message) => (account === 'all' || message.accountId === account) && (status === 'all' || (status === 'unread' && message.unread) || (status === 'important' && message.importance === 'high') || (status === 'reply' && message.needsReply))).sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
    }
    function counts() {
      const messages = ctx.getState().mailMessages.map(heuristics);
      return { accounts: ctx.getState().mailAccounts.length, unread: messages.filter((message) => message.unread).length, important: messages.filter((message) => message.importance === 'high').length, replies: messages.filter((message) => message.needsReply).length };
    }
    function renderAccounts() {
      const accounts = ctx.getState().mailAccounts;
      accountList.innerHTML = accounts.length ? accounts.map((account) => `<div class="mail-account-row"><span class="provider-mini">${PROVIDERS[account.provider]?.icon || '@'}</span><div><strong>${ctx.escape(account.email)}</strong><small>${PROVIDERS[account.provider]?.name || account.provider} · ${account.demo ? ctx.t('mail.demoMode') : ctx.t('mail.connected')}</small></div><button class="icon-button danger" type="button" data-mail-disconnect="${account.id}" aria-label="${ctx.t('mail.disconnect')}">×</button></div>`).join('') : `<p class="muted">${ctx.t('mail.noAccounts')}</p>`;
      const current = accountFilter.value;
      accountFilter.innerHTML = `<option value="all">${ctx.t('mail.allAccounts')}</option>` + accounts.map((account) => `<option value="${account.id}">${ctx.escape(account.email)}</option>`).join('');
      if ([...accountFilter.options].some((option) => option.value === current)) accountFilter.value = current;
      document.getElementById('mail-mode-label').textContent = API ? ctx.t('mail.secureMode') : ctx.t('mail.demoMode');
    }
    function renderMessages() {
      const messages = filteredMessages();
      messageList.innerHTML = messages.length ? messages.map((message) => `<article class="mail-message ${message.unread ? 'unread' : ''}"><div class="mail-message-status"><span class="importance ${message.importance}"></span></div><div class="mail-message-main"><div class="mail-message-top"><strong>${ctx.escape(message.subject || ctx.t('mail.noSubject'))}</strong><time>${ctx.formatDateTime(message.receivedAt)}</time></div><span class="mail-sender">${ctx.escape(message.sender || '')}</span><p>${ctx.escape(message.snippet || '')}</p><div class="mail-tags">${message.unread ? `<span>${ctx.t('mail.unread')}</span>` : ''}${message.importance === 'high' ? `<span>${ctx.t('mail.important')}</span>` : ''}${message.needsReply ? `<span>${ctx.t('mail.replyDue')}</span>` : ''}<span>${ctx.escape(PROVIDERS[message.provider]?.name || message.provider)}</span></div></div><div class="mail-message-actions"><button class="button secondary small" type="button" data-mail-task="${message.id}">${ctx.t('mail.createTask')}</button><button class="text-button" type="button" data-mail-remind="${message.id}">${ctx.t('mail.remindTomorrow')}</button><button class="icon-button" type="button" data-mail-resolve="${message.id}" title="${ctx.t('mail.resolve')}">✓</button></div></article>`).join('') : `<div class="empty-state">${ctx.t('mail.noMessages')}</div>`;
    }
    function renderDashboard() {
      const result = counts();
      ['accounts','unread','important'].forEach((key) => { const element = document.getElementById(`mail-kpi-${key}`); if (element) element.textContent = result[key]; });
      const replies = document.getElementById('mail-kpi-replies'); if (replies) replies.textContent = result.replies;
      const nav = document.getElementById('mail-nav-count'); if (nav) { nav.textContent = result.unread; nav.hidden = !result.unread; }
      const ids = { unread: 'dashboard-mail-unread', important: 'dashboard-mail-important', replies: 'dashboard-mail-replies' };
      Object.entries(ids).forEach(([key, id]) => { const element = document.getElementById(id); if (element) element.textContent = result[key]; });
      const copy = document.getElementById('dashboard-mail-copy'); if (copy) copy.textContent = result.accounts ? ctx.t('mail.dashboardCopy', result) : ctx.t('mail.dashboardEmpty');
    }
    function render() { renderDetection(); renderAccounts(); renderMessages(); renderDashboard(); }

    emailInput.addEventListener('input', () => { selectedProvider = ''; renderDetection(); });
    providerChoices.addEventListener('click', (event) => { const button = event.target.closest('[data-mail-provider-choice]'); if (!button) return; selectedProvider = button.dataset.mailProviderChoice; renderDetection(); });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = emailInput.value.trim().toLowerCase();
      if (!emailInput.checkValidity()) return emailInput.reportValidity();
      const provider = selectedProvider || detectProvider(email).provider;
      startConnection(provider, email);
    });
    document.getElementById('mail-add-account')?.addEventListener('click', () => { emailInput.focus(); emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    document.getElementById('mail-connect-close').addEventListener('click', () => dialog.close());
    credentialForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(credentialForm));
      try {
        if (!API) connectDemo(data.provider, data.email);
        else { await api('/api/mail/connect/imap', { method: 'POST', body: JSON.stringify(data) }); await refreshRemote(); }
        dialog.close();
        ctx.toast(ctx.t('mail.connected'));
      } catch { document.getElementById('mail-connect-message').textContent = ctx.t('mail.connectionFailed'); }
    });
    accountList.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-mail-disconnect]'); if (!button) return;
      const account = ctx.getState().mailAccounts.find((item) => item.id === button.dataset.mailDisconnect);
      if (API && account && !account.demo) { try { await api(`/api/mail/accounts/${encodeURIComponent(account.id)}`, { method: 'DELETE' }); } catch { return ctx.toast(ctx.t('common.error'), 'error'); } }
      ctx.updateState((state) => { state.mailAccounts = state.mailAccounts.filter((item) => item.id !== button.dataset.mailDisconnect); state.mailMessages = state.mailMessages.filter((item) => item.accountId !== button.dataset.mailDisconnect); });
    });
    messageList.addEventListener('click', (event) => {
      const taskButton = event.target.closest('[data-mail-task]');
      if (taskButton) {
        const message = ctx.getState().mailMessages.find((item) => item.id === taskButton.dataset.mailTask);
        if (message) ctx.updateState((state) => state.tasks.unshift({ id: ctx.uid(), title: message.subject || ctx.t('mail.replyDue'), category: 'Communication', priority: message.importance === 'high' ? 'high' : 'medium', important: true, urgent: message.importance === 'high', estimate: 20, dueDate: ctx.today(), done: false, createdAt: new Date().toISOString(), source: { type: 'mail', id: message.id, provider: message.provider } }));
        ctx.toast(ctx.t('mail.taskCreated'));
      }
      const remindButton = event.target.closest('[data-mail-remind]');
      if (remindButton) {
        const message = ctx.getState().mailMessages.find((item) => item.id === remindButton.dataset.mailRemind);
        if (message) {
          const due = new Date(); due.setDate(due.getDate() + 1);
          ctx.updateState((state) => state.tasks.unshift({ id: ctx.uid(), title: `${ctx.t('mail.replyDue')}: ${message.subject}`, category: 'Communication', priority: 'medium', important: true, urgent: false, estimate: 15, dueDate: due.toISOString().slice(0, 10), done: false, createdAt: new Date().toISOString(), source: { type: 'mail-reminder', id: message.id, provider: message.provider } }));
          ctx.toast(ctx.t('mail.reminderCreated'));
        }
      }
      const resolveButton = event.target.closest('[data-mail-resolve]');
      if (resolveButton) ctx.updateState((state) => { const message = state.mailMessages.find((item) => item.id === resolveButton.dataset.mailResolve); if (message) { message.unread = false; message.needsReply = false; } });
    });
    accountFilter.addEventListener('change', renderMessages);
    statusFilter.addEventListener('change', renderMessages);
    document.getElementById('mail-sync').addEventListener('click', async () => {
      if (API) {
        await refreshRemote();
      } else if (
        window.SigmaGoogle?.configured?.() &&
        ctx.getState().mailAccounts.some((account) => account.provider === 'gmail' && !account.demo)
      ) {
        try {
          const messages = await window.SigmaGoogle.importGmail();
          ctx.updateState((state) => {
            const importedMessages = (messages || []).map(heuristics);
            state.mailMessages = (state.mailMessages || [])
              .filter((message) => message.provider !== 'gmail')
              .concat(importedMessages)
              .sort((a, b) => String(b.receivedAt || '').localeCompare(String(a.receivedAt || '')));
            state.mailSettings.lastSync = new Date().toISOString();
          });
          render();
        } catch (error) {
          return ctx.toast(error.message, 'error');
        }
      } else {
        ctx.updateState((state) => {
          state.mailSettings.lastSync = new Date().toISOString();
        });
      }
      ctx.toast(ctx.t('mail.synced'));
    });

    ctx.subscribe(render);
    document.addEventListener('languagechange', render);
    render();
    if (API) refreshRemote();
    return { render, refreshRemote, detectProvider };
  }

  window.SUM_MODULES = window.SUM_MODULES || {};
  window.SUM_MODULES.initMail = initMail;
})();
