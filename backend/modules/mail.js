'use strict';
(() => {
  const PROVIDERS = {
    gmail: { name: 'Gmail / Google Workspace', icon: 'G' },
    microsoft: { name: 'Outlook / Microsoft 365', icon: 'M' },
    yahoo: { name: 'Yahoo Mail', icon: 'Y!' },
    apple: { name: 'Apple iCloud Mail', icon: '' },
    proton: { name: 'Proton Mail', icon: 'P' },
    imap: { name: 'IMAP / SMTP', icon: '@' },
    gmx: { name: 'GMX', icon: 'GMX' }
  };
  const PLATFORM = window.SIGMA_PLATFORM_CONFIG || {};

  function initMail(ctx) {
    const providerGrid = document.getElementById('mail-provider-grid');
    const accountList = document.getElementById('mail-account-list');
    const messageList = document.getElementById('mail-message-list');
    const accountFilter = document.getElementById('mail-account-filter');
    const statusFilter = document.getElementById('mail-status-filter');
    const dialog = document.getElementById('mail-connect-dialog');
    const credentialForm = document.getElementById('mail-connect-form');
    const configuredApi = String(PLATFORM.mailConnectorBaseUrl || window.SUM_CONFIG?.mailApiBaseUrl || '').replace(/\/$/, '');
    let activeProvider = '';

    const cleanLegacyDemo = () => ctx.updateState((state) => {
      state.mailAccounts = (state.mailAccounts || []).filter((account) => !account.demo);
      state.mailMessages = (state.mailMessages || []).filter((message) =>
        !message.demo && !String(message.sender || '').includes('.example') && !String(message.sender || '').includes('@local.test')
      );
    });

    function heuristics(message) {
      const text = `${message.subject || ''} ${message.snippet || ''}`.toLowerCase();
      const importantWords = ['urgent','important','deadline','invoice','facture','paiement','payment','client','action required','réponse','devis','quote','contrat'];
      const replyWords = ['?','please reply','répondre','confirmation','confirm','feedback','avis','availability','disponibilité'];
      const age = (Date.now() - new Date(message.receivedAt || Date.now()).getTime()) / 3600000;
      return { ...message, importance: message.importance === 'high' || importantWords.some((word) => text.includes(word)) ? 'high' : (message.importance || 'normal'), needsReply: Boolean(message.needsReply || (age > 18 && replyWords.some((word) => text.includes(word)))) };
    }
    async function api(path, options = {}) {
      if (!configuredApi) throw new Error('Connecteur serveur non configuré');
      const response = await fetch(`${configuredApi}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || payload.message || `MAIL_${response.status}`);
      return payload;
    }
    function cloudEmail() { return window.SigmaCloud?.user?.email || ''; }
    function upsertAccount(account, messages = []) {
      ctx.updateState((state) => {
        state.mailAccounts = (state.mailAccounts || []).filter((item) => item.provider !== account.provider);
        state.mailAccounts.push(account);
        state.mailMessages = (state.mailMessages || []).filter((item) => item.provider !== account.provider)
          .concat((messages || []).map(heuristics))
          .sort((a,b) => String(b.receivedAt || '').localeCompare(String(a.receivedAt || '')));
        state.mailSettings.lastSync = new Date().toISOString();
      });
    }
    async function connectGoogle() {
      if (!window.SigmaGoogle?.configured?.()) throw new Error('Client OAuth Google non configuré');
      const messages = await window.SigmaGoogle.importGmail();
      upsertAccount({ id:'google-gmail', provider:'gmail', email:cloudEmail() || 'Compte Google', label:'Google', demo:false, status:'connected', createdAt:new Date().toISOString() }, messages);
      ctx.toast(`Gmail connecté · ${messages.length} messages importés`);
    }
    async function connectMicrosoft() {
      if (configuredApi) { location.href = `${configuredApi}/api/mail/connect/microsoft`; return; }
      if (!PLATFORM.microsoftClientId) throw new Error('Ajoutez microsoftClientId dans platform-config.js');
      throw new Error('Le Client ID Microsoft est prêt, mais la synchronisation Outlook requiert le connecteur Microsoft Graph.');
    }
    function openCredential(provider) {
      activeProvider = provider;
      credentialForm.reset();
      credentialForm.elements.provider.value = provider;
      const presets = {
        yahoo: { title:'Connecter Yahoo Mail', help:"Créez un mot de passe d’application Yahoo. Votre mot de passe principal n’est jamais utilisé.", host:'imap.mail.yahoo.com', port:'993' },
        apple: { title:'Connecter iCloud Mail', help:"Créez un mot de passe spécifique à l’application dans votre compte Apple.", host:'imap.mail.me.com', port:'993' },
        proton: { title:'Connecter Proton Mail', help:'Proton nécessite Proton Mail Bridge sur un appareil ou un connecteur compatible Bridge.', host:'127.0.0.1', port:'1143' },
        imap: { title:'Connecter un fournisseur IMAP', help:'Utilisez un mot de passe d’application et les paramètres IMAP fournis par votre hébergeur.', host:'', port:'993' }
      };
      const preset=presets[provider];
      document.getElementById('mail-connect-title').textContent=preset.title;
      document.getElementById('mail-connect-help').textContent=preset.help;
      document.getElementById('mail-connect-guide').innerHTML=configuredApi?'<p>Les identifiants sont envoyés au connecteur sécurisé configuré et ne sont jamais stockés dans GitHub Pages.</p>':'<p class="info-callout">Le connecteur serveur n’est pas encore configuré. Vous pouvez préparer les paramètres, mais la connexion ne sera pas enregistrée.</p>';
      credentialForm.elements.email.value = cloudEmail();
      credentialForm.elements.imapHost.value=preset.host;
      credentialForm.elements.imapPort.value=preset.port;
      dialog.showModal();
    }
    async function providerAction(provider) {
      try {
        if (provider === 'google') return await connectGoogle();
        if (provider === 'microsoft') return await connectMicrosoft();
        openCredential(provider);
      } catch (error) { ctx.toast(error.message, 'error'); }
    }
    async function refreshGoogle() {
      const messages=await window.SigmaGoogle.importGmail();
      const account=(ctx.getState().mailAccounts || []).find(a=>a.provider==='gmail');
      upsertAccount({ id:'google-gmail', provider:'gmail', email:account?.email || cloudEmail() || 'Compte Google', label:'Google', demo:false, status:'connected', createdAt:account?.createdAt || new Date().toISOString() },messages);
      return messages.length;
    }
    async function refreshRemote() {
      const [accounts,messages]=await Promise.all([api('/api/mail/accounts'),api('/api/mail/messages?limit=100')]);
      ctx.updateState(state=>{state.mailAccounts=accounts.accounts||[];state.mailMessages=(messages.messages||[]).map(heuristics);state.mailSettings.lastSync=new Date().toISOString();});
    }
    function filteredMessages() {
      const account=accountFilter.value||'all', status=statusFilter.value||'all';
      return (ctx.getState().mailMessages||[]).map(heuristics).filter(m=>(account==='all'||m.accountId===account)&&(status==='all'||(status==='unread'&&m.unread)||(status==='important'&&m.importance==='high')||(status==='reply'&&m.needsReply))).sort((a,b)=>String(b.receivedAt||'').localeCompare(String(a.receivedAt||'')));
    }
    function counts(){const messages=(ctx.getState().mailMessages||[]).map(heuristics);return{accounts:(ctx.getState().mailAccounts||[]).length,unread:messages.filter(m=>m.unread).length,important:messages.filter(m=>m.importance==='high').length,replies:messages.filter(m=>m.needsReply).length};}
    function renderProviderStatus(){
      const accounts=ctx.getState().mailAccounts||[];
      const google=accounts.find(a=>a.provider==='gmail');
      const microsoft=accounts.find(a=>a.provider==='microsoft');
      const gs=document.querySelector('[data-provider-status="google"]'); if(gs)gs.textContent=google?`Connecté · ${google.email}`:(cloudEmail()?`Compte Sigma : ${cloudEmail()} · Activer Gmail`:'Connectez-vous à Sigma puis activez Gmail');
      const ms=document.querySelector('[data-provider-status="microsoft"]'); if(ms)ms.textContent=microsoft?`Connecté · ${microsoft.email}`:(PLATFORM.microsoftClientId?'Client Entra configuré · connecteur requis':'Configuration Entra ID requise');
      document.getElementById('mail-mode-label').textContent=accounts.length?'CONNECTÉ':'PRÊT';
    }
    function renderAccounts(){
      const accounts=ctx.getState().mailAccounts||[];
      accountList.innerHTML=accounts.length?accounts.map(a=>`<div class="mail-account-row"><span class="provider-mini">${PROVIDERS[a.provider]?.icon||'@'}</span><div><strong>${ctx.escape(a.email||PROVIDERS[a.provider]?.name||a.provider)}</strong><small>${ctx.escape(PROVIDERS[a.provider]?.name||a.provider)} · Connecté</small></div><button class="icon-button danger" type="button" data-mail-disconnect="${a.id}" aria-label="Déconnecter">×</button></div>`).join(''):'<p class="muted">Aucun fournisseur connecté. Commencez par Google ou choisissez un autre fournisseur.</p>';
      const current=accountFilter.value;accountFilter.innerHTML='<option value="all">Tous les comptes</option>'+accounts.map(a=>`<option value="${a.id}">${ctx.escape(a.email||a.provider)}</option>`).join('');if([...accountFilter.options].some(o=>o.value===current))accountFilter.value=current;
    }
    function renderMessages(){const messages=filteredMessages();messageList.innerHTML=messages.length?messages.map(m=>`<article class="mail-message ${m.unread?'unread':''}"><div class="mail-message-status"><span class="importance ${m.importance}"></span></div><div class="mail-message-main"><div class="mail-message-top"><strong>${ctx.escape(m.subject||'(Sans objet)')}</strong><time>${ctx.formatDateTime(m.receivedAt)}</time></div><span class="mail-sender">${ctx.escape(m.sender||'')}</span><p>${ctx.escape(m.snippet||'')}</p><div class="mail-tags">${m.unread?'<span>NON LU</span>':''}${m.importance==='high'?'<span>IMPORTANT</span>':''}${m.needsReply?'<span>RÉPONSE À PRÉVOIR</span>':''}<span>${ctx.escape(PROVIDERS[m.provider]?.name||m.provider)}</span></div></div><div class="mail-message-actions"><button class="button secondary small" type="button" data-mail-task="${m.id}">Créer une tâche</button>${m.sourceUrl?`<a class="text-button" href="${ctx.escape(m.sourceUrl)}" target="_blank" rel="noopener">Ouvrir</a>`:''}<button class="icon-button" type="button" data-mail-resolve="${m.id}">✓</button></div></article>`).join(''):'<div class="empty-state">Aucun message réel importé.</div>';}
    function renderDashboard(){const r=counts();['accounts','unread','important'].forEach(k=>{const e=document.getElementById(`mail-kpi-${k}`);if(e)e.textContent=r[k]});const e=document.getElementById('mail-kpi-replies');if(e)e.textContent=r.replies;const nav=document.getElementById('mail-nav-count');if(nav){nav.textContent=r.unread;nav.hidden=!r.unread;}}
    function render(){renderProviderStatus();renderAccounts();renderMessages();renderDashboard();}

    cleanLegacyDemo();
    providerGrid?.addEventListener('click',e=>{const b=e.target.closest('[data-mail-provider]');if(b)providerAction(b.dataset.mailProvider);});
    document.getElementById('mail-add-account')?.addEventListener('click',()=>document.getElementById('mail-provider-hub')?.scrollIntoView({behavior:'smooth',block:'center'}));
    document.getElementById('mail-connect-close')?.addEventListener('click',()=>dialog.close());
    credentialForm?.addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(credentialForm));const msg=document.getElementById('mail-connect-message');if(!configuredApi){msg.textContent='Configurez mailConnectorBaseUrl dans platform-config.js pour activer ce fournisseur.';return;}try{await api('/api/mail/connect/imap',{method:'POST',body:JSON.stringify(data)});dialog.close();await refreshRemote();ctx.toast('Fournisseur connecté');}catch(err){msg.textContent=err.message;}});
    accountList?.addEventListener('click',async e=>{const b=e.target.closest('[data-mail-disconnect]');if(!b)return;const account=(ctx.getState().mailAccounts||[]).find(a=>a.id===b.dataset.mailDisconnect);if(account?.provider==='gmail')window.SigmaGoogle?.disconnect?.();if(configuredApi&&account?.provider!=='gmail'){try{await api(`/api/mail/accounts/${encodeURIComponent(account.id)}`,{method:'DELETE'});}catch(err){return ctx.toast(err.message,'error');}}ctx.updateState(state=>{state.mailAccounts=(state.mailAccounts||[]).filter(a=>a.id!==b.dataset.mailDisconnect);state.mailMessages=(state.mailMessages||[]).filter(m=>m.accountId!==b.dataset.mailDisconnect);});});
    messageList?.addEventListener('click',e=>{const task=e.target.closest('[data-mail-task]');if(task){const m=(ctx.getState().mailMessages||[]).find(x=>x.id===task.dataset.mailTask);if(m)ctx.updateState(state=>state.tasks.unshift({id:ctx.uid(),title:m.subject||'Répondre au message',category:'Communication',priority:m.importance==='high'?'high':'medium',important:true,urgent:m.importance==='high',estimate:20,dueDate:ctx.today(),done:false,createdAt:new Date().toISOString(),source:{type:'mail',id:m.id,provider:m.provider}}));ctx.toast('Tâche créée');}const resolve=e.target.closest('[data-mail-resolve]');if(resolve)ctx.updateState(state=>{const m=(state.mailMessages||[]).find(x=>x.id===resolve.dataset.mailResolve);if(m){m.unread=false;m.needsReply=false;}});});
    accountFilter?.addEventListener('change',renderMessages);statusFilter?.addEventListener('change',renderMessages);
    document.getElementById('mail-sync')?.addEventListener('click',async()=>{try{const hasGoogle=(ctx.getState().mailAccounts||[]).some(a=>a.provider==='gmail');if(hasGoogle||(!configuredApi&&window.SigmaGoogle?.configured?.())){const n=await refreshGoogle();ctx.toast(`${n} messages Gmail actualisés`);}else if(configuredApi){await refreshRemote();ctx.toast('Messages actualisés');}else{ctx.toast('Connectez un fournisseur avant la synchronisation','error');}}catch(err){ctx.toast(err.message,'error');}});
    window.addEventListener('sigma:auth-changed',renderProviderStatus);
    ctx.subscribe(render);document.addEventListener('languagechange',render);render();
    return {render,refreshRemote};
  }
  window.SUM_MODULES=window.SUM_MODULES||{};window.SUM_MODULES.initMail=initMail;
})();
