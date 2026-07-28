(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function host(){
    const panel=document.getElementById('panel-feed')||document.getElementById('panel-today')||document.getElementById('panel-context');
    return panel?.querySelector('.main-content')||panel||null;
  }
  function mount(){
    const h=host();if(!h||document.getElementById('sigma-gmail-real-v1'))return false;
    const card=document.createElement('article');card.id='sigma-gmail-real-v1';card.className='card sigma-gmail-real-v1';
    h.prepend(card);render();return true;
  }
  function render(){
    const card=document.getElementById('sigma-gmail-real-v1');if(!card)return;
    const config=window.SigmaGmailConfigV1.read();
    const auth=window.SigmaGmailAuthSessionV1.status();
    const sync=window.SigmaGmailSyncV1.status();
    const messages=window.SigmaGmailPriorityEngineV1.ranked().slice(0,8);
    card.innerHTML=`<div class="card-heading"><div><span class="eyebrow">Gmail réel</span><h2>${auth.authenticated?'Boîte connectée':'Connexion requise'}</h2><p>${config.enabled?'Configuration activée':'Configuration absente ou désactivée'} · ${sync.messages||0} message(s) en cache.</p></div><div class="sigma-gmail-actions"><button type="button" class="button secondary compact" data-gmail-action="configure">Configurer</button><button type="button" class="button primary compact" data-gmail-action="${auth.authenticated?'sync':'connect'}">${auth.authenticated?'Synchroniser':'Connecter Gmail'}</button></div></div><div class="sigma-gmail-status"><span>Authentification : <strong>${auth.authenticated?'active':'inactive'}</strong></span><span>Dernière synchro : <strong>${sync.syncedAt?new Date(sync.syncedAt).toLocaleString():'jamais'}</strong></span></div><div class="sigma-gmail-messages">${messages.map(x=>`<article data-priority="${x.priority}"><div><strong>${esc(x.subject)}</strong><p>${esc(x.from)}</p></div><span>${x.priorityScore}/100</span><small>${esc(x.snippet)}</small></article>`).join('')||'<p class="muted">Aucun message réel synchronisé.</p>'}</div>`;
    card.querySelector('[data-gmail-action="configure"]')?.addEventListener('click',configure);
    card.querySelector('[data-gmail-action="connect"]')?.addEventListener('click',connect);
    card.querySelector('[data-gmail-action="sync"]')?.addEventListener('click',syncNow);
  }
  function configure(){
    const current=window.SigmaGmailConfigV1.read();
    const clientId=prompt('Google OAuth Client ID',current.clientId)||current.clientId;
    const apiKey=prompt('Google API Key',current.apiKey)||current.apiKey;
    window.SigmaGmailConfigV1.write({clientId,apiKey,enabled:Boolean(clientId)});
    render();
  }
  async function connect(){
    try{
      await window.SigmaGmailAuthSessionV1.init();
      await window.SigmaGmailAuthSessionV1.requestToken();
      await syncNow();
    }catch(e){alert(`Connexion Gmail impossible : ${e.message||e}`);render();}
  }
  async function syncNow(){
    try{await window.SigmaGmailSyncV1.sync();render();}
    catch(e){alert(`Synchronisation Gmail impossible : ${e.message||e}`);render();}
  }
  function boot(){mount();}
  window.addEventListener('sigma:gmail-synced',render);
  window.addEventListener('sigma:gmail-authenticated',render);
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1400),{once:true}):setTimeout(boot,1400);
  g.SigmaGmailUIV1={mount,render,configure,connect,syncNow,boot};
})(window);
