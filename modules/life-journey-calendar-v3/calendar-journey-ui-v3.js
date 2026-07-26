(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount(){
    if(document.getElementById('sigma-life-journey-calendar-v3'))return;
    const host=document.querySelector('#panel-planner .main-content,#panel-planner')||document.querySelector('main')||document.body;
    const card=document.createElement('article');
    card.id='sigma-life-journey-calendar-v3';card.className='card sigma-life-journey-calendar-v3';
    card.innerHTML=`<div class="card-heading"><div><span class="eyebrow">Calendrier unifié</span><h2>Calendriers, disponibilités et étapes de vie</h2><p>Importez vos calendriers, repérez les conflits et protégez les moments importants.</p></div><label class="button secondary compact sigma-file-button">Importer .ics<input id="sigma-v3-ics-file" type="file" accept=".ics,text/calendar"></label></div><div class="sigma-ljc-grid"><section><h3>Calendriers externes</h3><div id="sigma-v3-calendar-list"></div></section><section><h3>Prochaines étapes</h3><div id="sigma-v3-milestone-list"></div><button id="sigma-v3-add-milestone" type="button" class="button secondary compact">Ajouter une étape</button></section></div><section class="sigma-v3-availability"><h3>Disponibilités des 7 prochains jours</h3><div id="sigma-v3-availability-list"></div></section><section class="sigma-v3-journey"><div><span class="eyebrow">Mon parcours</span><h3 id="sigma-v3-weekly-prompt">Quel progrès mérite d’être reconnu cette semaine ?</h3></div><form id="sigma-v3-journey-form"><textarea name="text" placeholder="Une réussite, une difficulté, une décision ou un apprentissage…"></textarea><button class="button primary" type="submit">Conserver ce moment</button></form><div id="sigma-v3-journey-list"></div></section>`;
    host.prepend(card);
    bind();render();
  }
  function bind(){
    document.getElementById('sigma-v3-ics-file')?.addEventListener('change',async e=>{
      const file=e.target.files?.[0];if(!file)return;
      await window.SigmaCalendarImportWorkflowV3.importFile(file,{name:file.name});render();
    });
    document.getElementById('sigma-v3-add-milestone')?.addEventListener('click',()=>{
      const title=prompt('Nom de l’étape importante');if(!title)return;
      const date=prompt('Date (AAAA-MM-JJ)',new Date().toISOString().slice(0,10));if(!date)return;
      window.SigmaMilestonesV3.add({title,date});render();
    });
    document.getElementById('sigma-v3-journey-form')?.addEventListener('submit',e=>{
      e.preventDefault();const input=e.currentTarget.elements.text;const text=input.value.trim();if(!text)return;
      window.SigmaJourneyTimelineV3.add({text,tags:[]});input.value='';render();
    });
  }
  function render(){
    const calendars=document.getElementById('sigma-v3-calendar-list');
    if(calendars)calendars.innerHTML=window.SigmaExternalCalendars.list().map(x=>`<article class="sigma-v3-row"><div><strong>${esc(x.name)}</strong><small>${esc(x.provider)} · ${x.eventCount||0} événement(s)</small></div><span>${x.enabled?'Actif':'En pause'}</span></article>`).join('')||'<p class="muted">Aucun calendrier importé.</p>';
    const milestones=document.getElementById('sigma-v3-milestone-list');
    if(milestones)milestones.innerHTML=window.SigmaMilestonesV3.upcoming().slice(0,6).map(x=>`<article class="sigma-v3-row"><div><strong>${esc(x.title)}</strong><small>${esc(x.date)} · ${esc(x.type)}</small></div><span>${esc(x.status)}</span></article>`).join('')||'<p class="muted">Aucune étape à venir.</p>';
    const events=window.SigmaExternalEventStoreV3.list();
    const availability=document.getElementById('sigma-v3-availability-list');
    if(availability){
      const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return d;});
      availability.innerHTML=days.map(d=>{const slots=window.SigmaAvailabilityEngineV3.freeSlots(events,d,{minMinutes:60});return`<article><strong>${d.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})}</strong><span>${slots.length?`${slots.length} créneau(x) d’au moins 1 h`:'Journée chargée'}</span></article>`}).join('');
    }
    const entries=window.SigmaJourneyTimelineV3.list();
    const promptEl=document.getElementById('sigma-v3-weekly-prompt');if(promptEl)promptEl.textContent=window.SigmaJourneyInsightsV3.weeklyPrompt(entries.slice(0,10));
    const journey=document.getElementById('sigma-v3-journey-list');
    if(journey)journey.innerHTML=entries.slice(0,5).map(x=>`<article class="sigma-v3-journey-entry"><time>${new Date(x.date).toLocaleDateString()}</time><p>${esc(x.text)}</p></article>`).join('');
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,1000),{once:true}):setTimeout(mount,1000);
  g.SigmaLifeJourneyCalendarUIV3={mount,render};
})(window);
