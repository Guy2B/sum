(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount(){
    if(document.getElementById('sigma-support-coordination-v3'))return;
    const host=document.querySelector('#panel-context .main-content,#panel-context')||document.querySelector('main')||document.body;
    const card=document.createElement('article');
    card.id='sigma-support-coordination-v3';card.className='card sigma-support-coordination-v3';
    card.innerHTML=`<div class="card-heading"><div><span class="eyebrow">Coordination du quotidien</span><h2>Famille, école, emploi et accompagnement</h2><p>Transformez les profils de vie en plans simples, visibles et partageables.</p></div><button id="sigma-support-add-person" class="button secondary compact" type="button">Ajouter une personne</button></div><div class="sigma-support-grid"><section><h3>Personnes accompagnées</h3><div id="sigma-support-members"></div></section><section><h3>Plans actifs</h3><div id="sigma-support-plans"></div><button id="sigma-support-add-plan" class="button secondary compact" type="button">Créer un plan</button></section><section><h3>Recherche d’emploi</h3><div id="sigma-support-jobs"></div><button id="sigma-support-add-job" class="button secondary compact" type="button">Ajouter une candidature</button></section></div><section class="sigma-support-brief"><div><span class="eyebrow">Brief de la semaine</span><h3 id="sigma-support-brief-summary">Aucune urgence détectée.</h3></div><div id="sigma-support-recommendations"></div></section>`;
    host.prepend(card);bind();render();
  }
  function bind(){
    document.getElementById('sigma-support-add-person')?.addEventListener('click',()=>{const name=prompt('Nom de la personne');if(!name)return;const role=prompt('Rôle (child, parent, caregiver, member)','member')||'member';window.SigmaHouseholdMembersV3.add({name,role});render();});
    document.getElementById('sigma-support-add-plan')?.addEventListener('click',()=>{const title=prompt('Nom du plan de soutien');if(!title)return;window.SigmaSupportPlansV3.add({title});render();});
    document.getElementById('sigma-support-add-job')?.addEventListener('click',()=>{const company=prompt('Entreprise');if(!company)return;const title=prompt('Poste visé')||'Candidature';window.SigmaJobSearchPipelineV3.add({company,title,stage:'applied',appliedAt:new Date().toISOString()});render();});
  }
  function render(){
    const members=window.SigmaHouseholdMembersV3.list(),plans=window.SigmaSupportPlansV3.list(),jobs=window.SigmaJobSearchPipelineV3.list();
    const memberHost=document.getElementById('sigma-support-members');if(memberHost)memberHost.innerHTML=members.map(x=>`<article class="sigma-support-row"><div><strong>${esc(x.name)}</strong><small>${esc(x.role)}</small></div><span>${(x.supportNeeds||[]).length} besoin(s)</span></article>`).join('')||'<p class="muted">Aucune personne ajoutée.</p>';
    const planHost=document.getElementById('sigma-support-plans');if(planHost)planHost.innerHTML=plans.map(x=>`<article class="sigma-support-row"><div><strong>${esc(x.title)}</strong><small>${(x.tasks||[]).filter(t=>!t.done).length} tâche(s) ouverte(s)</small></div><span>${esc(x.status)}</span></article>`).join('')||'<p class="muted">Aucun plan actif.</p>';
    const jobHost=document.getElementById('sigma-support-jobs');if(jobHost)jobHost.innerHTML=jobs.map(x=>`<article class="sigma-support-row"><div><strong>${esc(x.company)}</strong><small>${esc(x.title)}</small></div><span>${esc(x.stage)}</span></article>`).join('')||'<p class="muted">Aucune candidature suivie.</p>';
    const brief=window.SigmaWeeklyFamilyBriefV3.build({members,plans,milestones:window.SigmaMilestonesV3?.list?.()||[],events:window.SigmaExternalEventStoreV3?.list?.()||[],jobItems:jobs});
    const summary=document.getElementById('sigma-support-brief-summary');if(summary)summary.textContent=brief.summary;
    const careLoad=window.SigmaCareLoadEngineV3.calculate({tasks:plans.flatMap(p=>p.tasks||[]),people:members});
    const recs=window.SigmaSupportRecommendationEngineV3.recommend({careLoad,jobFollowups:brief.jobFollowups});
    const recHost=document.getElementById('sigma-support-recommendations');if(recHost)recHost.innerHTML=recs.map(x=>`<article class="sigma-support-recommendation"><strong>${esc(x.title)}</strong><ul>${x.actions.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></article>`).join('');
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,1200),{once:true}):setTimeout(mount,1200);
  g.SigmaSupportCoordinationUIV3={mount,render};
})(window);
