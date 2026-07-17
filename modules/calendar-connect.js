'use strict';
(() => {
  const COPY = {
    fr: { title:'Calendriers connectés', sub:'Importez les événements en lecture seule pour que Σ connaisse vos échéances et votre disponibilité.', google:'Google Calendar', microsoft:'Outlook / Microsoft 365', connect:'Connecter', disconnect:'Déconnecter', sync:'Synchroniser', demo:'Démo explicite', connected:'Connecté', none:'Aucun calendrier connecté.', imported:'Calendrier synchronisé.', failed:'Le connecteur calendrier est indisponible.', readOnly:'Lecture seule : Σ ne crée, ne modifie et ne supprime aucun événement distant.' },
    en: { title:'Connected calendars', sub:'Import read-only events so Σ can understand deadlines and availability.', google:'Google Calendar', microsoft:'Outlook / Microsoft 365', connect:'Connect', disconnect:'Disconnect', sync:'Sync', demo:'Explicit demo', connected:'Connected', none:'No calendar connected.', imported:'Calendar synchronised.', failed:'The calendar connector is unavailable.', readOnly:'Read only: Σ does not create, edit or delete remote events.' },
    de: { title:'Verbundene Kalender', sub:'Importieren Sie Termine schreibgeschützt, damit Σ Fristen und Verfügbarkeit versteht.', google:'Google Kalender', microsoft:'Outlook / Microsoft 365', connect:'Verbinden', disconnect:'Trennen', sync:'Synchronisieren', demo:'Explizite Demo', connected:'Verbunden', none:'Kein Kalender verbunden.', imported:'Kalender synchronisiert.', failed:'Der Kalender-Connector ist nicht verfügbar.', readOnly:'Nur Lesen: Σ erstellt, ändert oder löscht keine entfernten Termine.' },
    es: { title:'Calendarios conectados', sub:'Importa eventos en modo lectura para que Σ comprenda plazos y disponibilidad.', google:'Google Calendar', microsoft:'Outlook / Microsoft 365', connect:'Conectar', disconnect:'Desconectar', sync:'Sincronizar', demo:'Demo explícita', connected:'Conectado', none:'Ningún calendario conectado.', imported:'Calendario sincronizado.', failed:'El conector de calendario no está disponible.', readOnly:'Solo lectura: Σ no crea, modifica ni elimina eventos remotos.' }
  };
  function initCalendarConnect(ctx) {
    const dialog = document.getElementById('calendar-connect-dialog');
    if (!dialog) return { render() {} };
    const list = document.getElementById('calendar-account-list');
    const copy = () => COPY[ctx.language()] || COPY.en;
    const base = () => String(window.SUM_CONFIG?.calendarApiBaseUrl || '').replace(/\/$/, '');
    const esc = ctx.escape;
    async function request(path, options={}) {
      const response = await fetch(`${base()}${path}`, { credentials:'include', headers:{'Content-Type':'application/json', ...(options.headers||{})}, ...options });
      const payload = await response.json().catch(()=>({})); if(!response.ok) throw new Error(payload.error || `Calendar ${response.status}`); return payload;
    }
    function providerName(provider) { return provider === 'google' ? copy().google : copy().microsoft; }
    function render() {
      document.getElementById('calendar-connect-title').textContent = copy().title;
      document.getElementById('calendar-connect-sub').textContent = copy().sub;
      document.getElementById('calendar-connect-readonly').textContent = copy().readOnly;
      document.getElementById('calendar-sync').textContent = copy().sync;
      document.querySelectorAll('[data-calendar-provider]').forEach((button)=>{ button.querySelector('strong').textContent = providerName(button.dataset.calendarProvider); button.querySelector('small').textContent = base() ? 'OAuth · read-only' : copy().demo; });
      const accounts = ctx.getState().calendarAccounts || [];
      list.innerHTML = accounts.length ? accounts.map((account)=>`<article class="calendar-account-chip"><span>${account.provider==='google'?'G':'M'}</span><div><strong>${esc(account.label || account.email || providerName(account.provider))}</strong><small>${esc(providerName(account.provider))} · ${account.demo ? esc(copy().demo) : esc(copy().connected)}</small></div><button class="icon-button danger" type="button" data-calendar-disconnect="${esc(account.id)}" aria-label="${esc(copy().disconnect)}">×</button></article>`).join('') : `<div class="empty-state compact">${esc(copy().none)}</div>`;
    }
    function demo(provider) {
      const id=`demo-calendar-${provider}`; const today=new Date(); const date=(offset)=>{const d=new Date(today);d.setDate(d.getDate()+offset);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);};
      ctx.updateState((state)=>{
        state.calendarAccounts=(state.calendarAccounts||[]).filter((a)=>a.provider!==provider);
        state.calendarAccounts.push({id,provider,email:`demo@${provider}.test`,label:providerName(provider),demo:true,status:'connected',createdAt:new Date().toISOString()});
        const rows=[{id:`${id}-1`,externalId:`${id}-1`,externalProvider:provider,title:'Rendez-vous client',date:date(0),time:'15:30',startAt:`${date(0)}T15:30:00`,source:'calendar-demo'},{id:`${id}-2`,externalId:`${id}-2`,externalProvider:provider,title:'Échéance de proposition',date:date(1),time:'10:00',startAt:`${date(1)}T10:00:00`,source:'calendar-demo'}];
        state.events=(state.events||[]).filter((e)=>e.externalProvider!==provider); state.events.push(...rows);
      });
      ctx.toast(copy().imported); render();
    }
    async function refreshAccounts() {
      if(!base()) return render();
      try { const payload=await request('/api/calendar/accounts'); ctx.updateState((state)=>{state.calendarAccounts=payload.accounts||[];}); } catch { /* keep local */ }
      render();
    }
    async function sync() {
      if(!base()) { const provider=(ctx.getState().calendarAccounts||[])[0]?.provider || 'google'; demo(provider); return; }
      try { const payload=await request('/api/calendar/events'); ctx.updateState((state)=>{const providers=new Set((payload.events||[]).map((e)=>e.provider)); state.events=(state.events||[]).filter((e)=>!providers.has(e.externalProvider)); state.events.push(...(payload.events||[]).map((e)=>({...e,externalProvider:e.provider,source:'calendar-connector'}))); state.calendarSettings={...(state.calendarSettings||{}),lastSync:new Date().toISOString()};}); ctx.toast(copy().imported); }
      catch { ctx.toast(copy().failed,'error'); }
      render();
    }
    document.addEventListener('click',(event)=>{
      if(event.target.closest('[data-calendar-open]')) { dialog.showModal(); refreshAccounts(); }
      const provider=event.target.closest('[data-calendar-provider]')?.dataset.calendarProvider;
      if(provider) { if(base()) location.href=`${base()}/api/calendar/connect/${encodeURIComponent(provider)}`; else demo(provider); }
      const id=event.target.closest('[data-calendar-disconnect]')?.dataset.calendarDisconnect;
      if(id) { const account=(ctx.getState().calendarAccounts||[]).find((a)=>a.id===id); if(base()&&!account?.demo) request(`/api/calendar/accounts/${encodeURIComponent(id)}`,{method:'DELETE'}).catch(()=>{}); ctx.updateState((state)=>{state.calendarAccounts=(state.calendarAccounts||[]).filter((a)=>a.id!==id);state.events=(state.events||[]).filter((e)=>e.accountId!==id && e.externalProvider!==account?.provider);}); render(); }
    });
    document.getElementById('calendar-connect-close')?.addEventListener('click',()=>dialog.close());
    document.getElementById('calendar-sync')?.addEventListener('click',sync);
    const params=new URLSearchParams(location.search); if(params.get('calendar')==='connected'){refreshAccounts().then(sync);history.replaceState({},'',`${location.pathname}${location.hash||'#connections'}`);} else render();
    ctx.subscribe(render); document.addEventListener('languagechange',render); render();
    return { render, sync };
  }
  window.SUM_MODULES=window.SUM_MODULES||{}; window.SUM_MODULES.initCalendarConnect=initCalendarConnect;
})();
