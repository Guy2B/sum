(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function ensure(){
    if(document.getElementById('sigma-essential-context'))return;
    const host=
      document.querySelector('#panel-context .main-content')||
      document.querySelector('#panel-context')||
      document.querySelector('[data-context-mount]');
    if(!host)return;
    const card=document.createElement('article');card.id='sigma-essential-context';card.className='card sigma-essential-context';
    card.innerHTML='<div class="card-heading"><div><span class="eyebrow">Essentiel</span><h2>Contexte, profils de vie et accompagnements</h2></div><button id="sigma-context-save" class="button secondary compact" type="button">Enregistrer</button></div><p class="sigma-context-intro">Aide Sigma à comprendre ta situation afin d’adapter ses réponses, ses priorités et son accompagnement.</p><div class="sigma-context-grid"><section><h3>Profils de vie</h3><div id="sigma-life-profiles" class="sigma-chip-grid"></div></section><section><h3>Accompagnements actifs</h3><div id="sigma-supports" class="sigma-chip-grid"></div></section></div><section><h3>Préférences de réponse</h3><div class="sigma-preference-row"><label>Ton<select id="sigma-pref-tone"><option value="balanced">Équilibré</option><option value="warm">Chaleureux</option><option value="direct">Direct</option></select></label><label>Profondeur<select id="sigma-pref-depth"><option value="guided">Guidée</option><option value="concise">Concise</option><option value="detailed">Détaillée</option></select></label><label>Format<select id="sigma-pref-format"><option value="structured">Structuré</option><option value="conversational">Conversationnel</option><option value="step-by-step">Étape par étape</option></select></label></div></section><section><h3>Suggestions de Sigma</h3><div id="sigma-context-recommendations"></div></section><details><summary>Calendriers externes et import .ics</summary><div class="sigma-import-row"><input id="sigma-ics-file" type="file" accept=".ics,text/calendar"><a target="_blank" rel="noopener" href="https://calendar.google.com/calendar/u/0/r/settings/export">Exporter depuis Google Calendar</a><a target="_blank" rel="noopener" href="https://outlook.live.com/calendar/0/options/calendar/SharedCalendars">Exporter depuis Outlook</a></div><p id="sigma-import-result" class="muted"></p></details><details><summary>Mon parcours</summary><div class="sigma-journey-compose"><textarea id="sigma-journey-text" placeholder="Qu’aimerais-tu retenir d’aujourd’hui ?"></textarea><button id="sigma-journey-add" type="button">Ajouter au parcours</button></div><div id="sigma-journey-list"></div></details>';
    host.prepend(card);
    bind();
  }
  function selected(container){return [...container.querySelectorAll('input:checked')].map(x=>x.value);}
  function bind(){
    document.getElementById('sigma-context-save')?.addEventListener('click',()=>{
      const current=window.SigmaContextProfile.load();
      window.SigmaContextProfile.save({...current,lifeProfiles:selected(document.getElementById('sigma-life-profiles')),activeSupports:selected(document.getElementById('sigma-supports')),responsePreferences:{tone:document.getElementById('sigma-pref-tone').value,depth:document.getElementById('sigma-pref-depth').value,format:document.getElementById('sigma-pref-format').value}});
      render();
    });
    document.getElementById('sigma-ics-file')?.addEventListener('change',async e=>{
      const file=e.target.files?.[0];if(!file)return;
      const events=window.SigmaCalendarImport.importICS(await file.text());
      const result=document.getElementById('sigma-import-result');if(result)result.textContent=`${events.length} événement(s) importé(s) et prêts à être examinés.`;
    });
    document.getElementById('sigma-journey-add')?.addEventListener('click',()=>{
      const input=document.getElementById('sigma-journey-text');const text=input.value.trim();if(!text)return;
      window.SigmaJourney.add({text});input.value='';renderJourney();
    });
  }
  function renderJourney(){
    const host=document.getElementById('sigma-journey-list');
    if(host)host.innerHTML=window.SigmaJourney.list().slice(0,12).map(x=>`<article class="sigma-journey-card"><strong>${new Date(x.createdAt).toLocaleDateString()}</strong><p>${esc(x.text)}</p></article>`).join('')||'<p class="muted">Ton parcours commencera ici.</p>';
  }
  function render(){
    ensure();
    const context=window.SigmaContextProfile.load();
    const profiles=document.getElementById('sigma-life-profiles');
    if(profiles)profiles.innerHTML=window.SigmaLifeProfileCatalog.list().map(x=>`<label class="sigma-context-chip"><input type="checkbox" value="${esc(x.id)}" ${context.lifeProfiles.includes(x.id)?'checked':''}><span>${x.icon} ${esc(x.label)}</span></label>`).join('');
    const supports=document.getElementById('sigma-supports');
    if(supports)supports.innerHTML=window.SigmaSupportCatalog.list().map(x=>`<label class="sigma-context-chip"><input type="checkbox" value="${esc(x.id)}" ${context.activeSupports.includes(x.id)?'checked':''}><span>${esc(x.label)}</span></label>`).join('');
    document.getElementById('sigma-pref-tone').value=context.responsePreferences.tone;
    document.getElementById('sigma-pref-depth').value=context.responsePreferences.depth;
    document.getElementById('sigma-pref-format').value=context.responsePreferences.format;
    const rec=document.getElementById('sigma-context-recommendations');
    if(rec)rec.innerHTML=window.SigmaContextRecommendations.recommend(context).map(x=>`<p><strong>${esc(x.support.label)}</strong> · ${esc(x.reason)}</p>`).join('')||'<p class="muted">Aucune suggestion supplémentaire.</p>';
    renderJourney();
  }
  function syncVisibility(){
    const card=document.getElementById('sigma-essential-context');
    const panel=document.getElementById('panel-context');
    if(card&&panel)card.hidden=!panel.classList.contains('active');
  }
  function boot(){
    ensure();render();syncVisibility();
    window.addEventListener('sigma:context-updated',render);
    window.addEventListener('hashchange',()=>setTimeout(syncVisibility,20));
    document.addEventListener('click',e=>{
      if(e.target.closest?.('[data-panel]'))setTimeout(syncVisibility,20);
    });
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900),{once:true}):setTimeout(boot,900);
  g.SigmaEssentialContextUI={render};
})(window);
