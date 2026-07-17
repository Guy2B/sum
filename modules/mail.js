'use strict';
(() => {
  const PROVIDERS = {
    gmail: { name: 'Gmail', icon: 'G', mode: 'oauth' },
    outlook: { name: 'Outlook', icon: 'O', mode: 'oauth' },
    yahoo: { name: 'Yahoo Mail', icon: 'Y!', mode: 'imap' },
    gmx: { name: 'GMX', icon: 'GMX', mode: 'imap' }
  };

  function initMail(ctx) {
    const providerGrid = document.getElementById('mail-provider-grid');
    if (!providerGrid) return { render() {} };
    const accountList = document.getElementById('mail-account-list');
    const messageList = document.getElementById('mail-message-list');
    const accountFilter = document.getElementById('mail-account-filter');
    const statusFilter = document.getElementById('mail-status-filter');
    const dialog = document.getElementById('mail-connect-dialog');
    const form = document.getElementById('mail-connect-form');
    const API = String(window.SUM_CONFIG.mailApiBaseUrl || '').replace(/\/$/, '');

    const copy = () => ctx.t('mail.demoAccount');
    function nowMinus(hours) { return new Date(Date.now() - hours * 3600000).toISOString(); }
    function demoMessages(provider, accountId) {
      const name = PROVIDERS[provider].name;
      return [
        { id: ctx.uid(), accountId, provider, subject: ctx.t('mail.demoUrgent'), sender: `client@${provider}.example`, snippet: ctx.t('mail.demoUrgentSnippet'), receivedAt: nowMinus(4), unread: true, importance: 'high', needsReply: true, sourceUrl: '' },
        { id: ctx.uid(), accountId, provider, subject: ctx.t('mail.demoInvoice'), sender: `billing@${provider}.example`, snippet: ctx.t('mail.demoInvoiceSnippet'), receivedAt: nowMinus(26), unread: true, importance: 'normal', needsReply: false, sourceUrl: '' },
        { id: ctx.uid(), accountId, provider, subject: `${name} · ${ctx.t('mail.demoNewsletter')}`, sender: `news@${provider}.example`, snippet: ctx.t('mail.demoNewsletterSnippet'), receivedAt: nowMinus(52), unread: false, importance: 'low', needsReply: false, sourceUrl: '' }
      ];
    }
    function heuristics(message) {
      const text = `${message.subject || ''} ${message.snippet || ''}`.toLowerCase();
      const importantWords = ['urgent','important','deadline','invoice','facture','paiement','payment','client','action required','réponse','antwort','respuesta'];
      const replyWords = ['?','please reply','répondre','confirmation','confirm','feedback','avis','antwort','respuesta'];
      const age = (Date.now() - new Date(message.receivedAt).getTime()) / 3600000;
      return {
        ...message,
        importance: message.importance === 'high' || importantWords.some((word) => text.includes(word)) ? 'high' : (message.importance || 'normal'),
        needsReply: Boolean(message.needsReply || (age > 18 && replyWords.some((word) => text.includes(word))))
      };
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
      const existing = ctx.getState().mailAccounts.find((account) => account.provider === provider);
      if (existing) return ctx.toast(ctx.t('mail.alreadyConnected'), 'error');
      const accountId = ctx.uid();
      ctx.updateState((state) => {
        state.mailAccounts.push({ id: accountId, provider, email: email || `${provider}.demo@sum.local`, status: 'connected', demo: true });
        state.mailMessages.unshift(...demoMessages(provider, accountId));
        state.mailSettings.lastSync = new Date().toISOString();
      });
      ctx.toast(ctx.t('mail.demoConnected', { provider: PROVIDERS[provider].name }));
    }
    function openConnect(provider) {
      if (API && PROVIDERS[provider].mode === 'oauth') { location.href = `${API}/api/mail/connect/${provider}`; return; }
      if (!API) { connectDemo(provider); return; }
      form.reset(); form.elements.provider.value = provider;
      document.getElementById('mail-connect-title').textContent = `${ctx.t('mail.connect')} ${PROVIDERS[provider].name}`;
      document.getElementById('mail-connect-help').textContent = ctx.t(provider === 'yahoo' ? 'mail.yahooHelp' : 'mail.gmxHelp');
      dialog.showModal();
    }
    function filteredMessages() {
      const account = accountFilter.value || 'all'; const status = statusFilter.value || 'all';
      return ctx.getState().mailMessages.map(heuristics).filter((m) => (account === 'all' || m.accountId === account) && (status === 'all' || (status === 'unread' && m.unread) || (status === 'important' && m.importance === 'high') || (status === 'reply' && m.needsReply))).sort((a,b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
    }
    function counts() {
      const messages=ctx.getState().mailMessages.map(heuristics);
      return { accounts: ctx.getState().mailAccounts.length, unread: messages.filter(m=>m.unread).length, important: messages.filter(m=>m.importance==='high').length, replies: messages.filter(m=>m.needsReply).length };
    }
    function renderProviders() {
      const accounts=ctx.getState().mailAccounts;
      providerGrid.innerHTML=Object.entries(PROVIDERS).map(([key,p])=>{const connected=accounts.some(a=>a.provider===key);return `<button class="mail-provider ${connected?'connected':''}" type="button" data-mail-provider="${key}"><span>${p.icon}</span><div><strong>${p.name}</strong><small>${connected?ctx.t('mail.connected'):ctx.t(p.mode==='oauth'?'mail.oauth':'mail.appPasswordRequired')}</small></div><b>${connected?'✓':'+'}</b></button>`}).join('');
      document.getElementById('mail-mode-label').textContent=API?'CONNECTED':'DEMO';
    }
    function renderAccounts() {
      const accounts=ctx.getState().mailAccounts;
      accountList.innerHTML=accounts.length?accounts.map(a=>`<div class="mail-account-row"><span class="provider-mini">${PROVIDERS[a.provider]?.icon||'@'}</span><div><strong>${ctx.escape(a.email)}</strong><small>${PROVIDERS[a.provider]?.name||a.provider} · ${a.demo?ctx.t('mail.demoMode'):ctx.t('mail.connected')}</small></div><button class="icon-button danger" type="button" data-mail-disconnect="${a.id}">×</button></div>`).join(''):`<p class="muted">${ctx.t('mail.noAccounts')}</p>`;
      const current=accountFilter.value;
      accountFilter.innerHTML=`<option value="all">${ctx.t('mail.allAccounts')}</option>`+accounts.map(a=>`<option value="${a.id}">${ctx.escape(a.email)}</option>`).join('');
      if([...accountFilter.options].some(o=>o.value===current)) accountFilter.value=current;
    }
    function renderMessages() {
      const messages=filteredMessages();
      messageList.innerHTML=messages.length?messages.map(m=>`<article class="mail-message ${m.unread?'unread':''}"><div class="mail-message-status"><span class="importance ${m.importance}"></span></div><div class="mail-message-main"><div class="mail-message-top"><strong>${ctx.escape(m.subject||ctx.t('mail.noSubject'))}</strong><time>${ctx.formatDateTime(m.receivedAt)}</time></div><span class="mail-sender">${ctx.escape(m.sender||'')}</span><p>${ctx.escape(m.snippet||'')}</p><div class="mail-tags">${m.unread?`<span>${ctx.t('mail.unread')}</span>`:''}${m.importance==='high'?`<span>${ctx.t('mail.important')}</span>`:''}${m.needsReply?`<span>${ctx.t('mail.replyDue')}</span>`:''}</div></div><div class="mail-message-actions"><button class="button secondary small" type="button" data-mail-task="${m.id}">${ctx.t('mail.createTask')}</button><button class="icon-button" type="button" data-mail-resolve="${m.id}" title="${ctx.t('mail.resolve')}">✓</button></div></article>`).join(''):`<div class="empty-state">${ctx.t('mail.noMessages')}</div>`;
    }
    function renderDashboard() {
      const c=counts();
      ['accounts','unread','important'].forEach(k=>{const el=document.getElementById(`mail-kpi-${k}`);if(el)el.textContent=c[k]});
      const r=document.getElementById('mail-kpi-replies');if(r)r.textContent=c.replies;
      const nav=document.getElementById('mail-nav-count');if(nav){nav.textContent=c.unread;nav.hidden=!c.unread;}
      const map={unread:'dashboard-mail-unread',important:'dashboard-mail-important',replies:'dashboard-mail-replies'};Object.entries(map).forEach(([k,id])=>{const el=document.getElementById(id);if(el)el.textContent=c[k]});
      const copy=document.getElementById('dashboard-mail-copy');if(copy)copy.textContent=c.accounts?ctx.t('mail.dashboardCopy',{unread:c.unread,important:c.important,replies:c.replies}):ctx.t('mail.dashboardEmpty');
    }
    function render(){renderProviders();renderAccounts();renderMessages();renderDashboard();}

    providerGrid.addEventListener('click',e=>{const b=e.target.closest('[data-mail-provider]');if(b)openConnect(b.dataset.mailProvider)});
    accountList.addEventListener('click',async e=>{const b=e.target.closest('[data-mail-disconnect]');if(!b)return;const account=ctx.getState().mailAccounts.find(a=>a.id===b.dataset.mailDisconnect);if(API&&!account?.demo){try{await api(`/api/mail/accounts/${encodeURIComponent(b.dataset.mailDisconnect)}`,{method:'DELETE'})}catch{return ctx.toast(ctx.t('common.error'),'error')}}ctx.updateState(s=>{s.mailAccounts=s.mailAccounts.filter(a=>a.id!==b.dataset.mailDisconnect);s.mailMessages=s.mailMessages.filter(m=>m.accountId!==b.dataset.mailDisconnect)});});
    messageList.addEventListener('click',e=>{const task=e.target.closest('[data-mail-task]');if(task){const m=ctx.getState().mailMessages.find(x=>x.id===task.dataset.mailTask);if(m){ctx.updateState(s=>s.tasks.unshift({id:ctx.uid(),title:m.subject||ctx.t('mail.replyTask'),category:'Admin',priority:m.importance==='high'?'high':'medium',important:true,urgent:m.importance==='high',estimate:20,dueDate:ctx.today(),done:false,createdAt:new Date().toISOString(),source:{type:'mail',id:m.id}}));ctx.toast(ctx.t('mail.taskCreated'));}}const resolve=e.target.closest('[data-mail-resolve]');if(resolve)ctx.updateState(s=>{const m=s.mailMessages.find(x=>x.id===resolve.dataset.mailResolve);if(m){m.needsReply=false;m.unread=false;}})});
    accountFilter.addEventListener('change',renderMessages);statusFilter.addEventListener('change',renderMessages);
    document.getElementById('mail-sync').addEventListener('click',async()=>{if(API)await refreshRemote();else ctx.updateState(s=>{s.mailSettings.lastSync=new Date().toISOString()});ctx.toast(ctx.t('mail.synced'));});
    document.getElementById('mail-connect-close').addEventListener('click',()=>dialog.close());
    form.addEventListener('submit',async e=>{e.preventDefault();const data=new FormData(form);const provider=String(data.get('provider'));if(!API){connectDemo(provider,String(data.get('email')));dialog.close();return;}try{await api('/api/mail/connect/imap',{method:'POST',body:JSON.stringify({provider,email:String(data.get('email')).trim(),appPassword:String(data.get('appPassword'))})});dialog.close();form.reset();await refreshRemote();ctx.toast(ctx.t('mail.connected'));}catch{document.getElementById('mail-connect-message').textContent=ctx.t('mail.connectionFailed')}});
    ctx.subscribe(render);document.addEventListener('languagechange',render);render();
    if(API) refreshRemote();
    return {render,refreshRemote};
  }
  window.SUM_MODULES=window.SUM_MODULES||{};window.SUM_MODULES.initMail=initMail;
})();
