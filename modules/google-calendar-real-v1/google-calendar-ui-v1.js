(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function errorMessage(error){
    if(!error)return 'Erreur Google inconnue.';
    if(typeof error==='string')return error;
    const details=[error.message,error.error_description,typeof error.error==='string'?error.error:'',error.details?.error?.message,error.result?.error?.message,error.body].filter(Boolean).map(String);
    if(details.length)return [...new Set(details)].join(' · ');
    try{return JSON.stringify(error);}
    catch{return String(error);}
  }
  function host(){
    const panel=document.getElementById('panel-plan')||document.getElementById('panel-calendar')||document.getElementById('panel-context');
    return panel?.querySelector('.main-content')||panel||null;
  }
  function mount(){
    const h=host();if(!h||document.getElementById('sigma-google-calendar-real-v1'))return false;
    const card=document.createElement('article');card.id='sigma-google-calendar-real-v1';card.className='card sigma-google-calendar-real-v1';
    h.prepend(card);render();return true;
  }
  function render(){
    const card=document.getElementById('sigma-google-calendar-real-v1');if(!card)return;
    const config=window.SigmaGoogleCalendarConfigV1.read();
    const auth=window.SigmaGoogleAuthSessionV1.status();
    const sync=window.SigmaGoogleCalendarSyncV1.status();
    const events=window.SigmaGoogleCalendarStoreV1.listEvents().slice(0,8);
    card.innerHTML=`<div class="card-heading"><div><span class="eyebrow">Google Calendar réel</span><h2>${auth.authenticated?'Calendrier connecté':'Connexion requise'}</h2><p>${config.enabled?'Configuration activée':'Configuration absente ou désactivée'} · ${sync.events||0} événement(s) en cache.</p></div><div class="sigma-google-calendar-actions"><button type="button" class="button secondary compact" data-gcal-action="configure">Configurer</button><button type="button" class="button primary compact" data-gcal-action="${auth.authenticated?'sync':'connect'}">${auth.authenticated?'Synchroniser':'Connecter Google'}</button></div></div><div class="sigma-google-calendar-status"><span>Authentification : <strong>${auth.authenticated?'active':'inactive'}</strong></span><span>Dernière synchro : <strong>${sync.syncedAt?new Date(sync.syncedAt).toLocaleString():'jamais'}</strong></span></div><div class="sigma-google-calendar-events">${events.map(x=>`<article><time>${new Date(x.start).toLocaleString()}</time><div><strong>${esc(x.title)}</strong><p>${esc(x.calendarName||x.calendarId||'Google Calendar')}</p></div></article>`).join('')||'<p class="muted">Aucun événement réel synchronisé.</p>'}</div>`;
    card.querySelector('[data-gcal-action="configure"]')?.addEventListener('click',configure);
    card.querySelector('[data-gcal-action="connect"]')?.addEventListener('click',connect);
    card.querySelector('[data-gcal-action="sync"]')?.addEventListener('click',syncNow);
  }
  function configure(){
    const current=window.SigmaGoogleCalendarConfigV1.read();
    const clientId=prompt('Google OAuth Client ID',current.clientId)||current.clientId;
    const apiKey=prompt('Google API Key',current.apiKey)||current.apiKey;
    const enabled=Boolean(clientId);
    window.SigmaGoogleCalendarConfigV1.write({clientId,apiKey,enabled});
    render();
  }
  async function connect(){
    try{
      await window.SigmaGoogleAuthSessionV1.init();
      await window.SigmaGoogleAuthSessionV1.requestToken();
      await syncNow();
    }catch(e){console.error('[SigmaGoogleCalendar] connection failed',e);alert(`Connexion Google impossible : ${errorMessage(e)}`);render();}
  }
  async function syncNow(){
    try{await window.SigmaGoogleCalendarSyncV1.sync();render();}
    catch(e){console.error('[SigmaGoogleCalendar] sync failed',e);alert(`Synchronisation impossible : ${errorMessage(e)}`);render();}
  }
  function boot(){mount();}
  window.addEventListener('sigma:google-calendar-synced',render);
  window.addEventListener('sigma:google-calendar-authenticated',render);
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1200),{once:true}):setTimeout(boot,1200);
  g.SigmaGoogleCalendarUIV1={mount,render,configure,connect,syncNow,boot};
})(window);
