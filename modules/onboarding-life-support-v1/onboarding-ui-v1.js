(function(g){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function ensure(){
    let dialog=document.getElementById('sigma-life-support-onboarding-v1');
    if(dialog)return dialog;
    dialog=document.createElement('dialog');
    dialog.id='sigma-life-support-onboarding-v1';
    dialog.className='sigma-life-support-onboarding-v1';
    document.body.appendChild(dialog);
    return dialog;
  }
  function checked(name){
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x=>x.value);
  }
  function open(){
    const dialog=ensure();
    const current=window.SigmaOnboardingStateV1.read();
    const rec=window.SigmaOnboardingRecommendationEngineV1.build();
    const lifeSelected=new Set(current.selectedLifeProfiles.length?current.selectedLifeProfiles:rec.lifeProfiles.map(x=>x.id));
    const supportSelected=new Set(current.selectedSupportProfiles.length?current.selectedSupportProfiles:rec.supportProfiles.map(x=>x.id));
    dialog.innerHTML=`<form method="dialog"><header><span class="eyebrow">Bienvenue dans Sigma</span><h2>Quels domaines de vie voulez-vous organiser?</h2><p>Ces choix personnalisent votre contexte. Vous pourrez les modifier plus tard.</p></header><section><h3>Profils de vie</h3><div class="sigma-onboarding-options">${window.SigmaLifeProfileProposalsV1.list().map(x=>`<label><input type="checkbox" name="sigma-life-profile" value="${x.id}" ${lifeSelected.has(x.id)?'checked':''}><span><strong>${esc(x.label)}</strong><small>${esc(x.description)}</small></span></label>`).join('')}</div></section><section><h3>Accompagnements actifs</h3><div class="sigma-onboarding-options">${window.SigmaSupportProfileProposalsV1.list().map(x=>`<label><input type="checkbox" name="sigma-support-profile" value="${x.id}" ${supportSelected.has(x.id)?'checked':''}><span><strong>${esc(x.label)}</strong><small>${esc(x.description)}</small></span></label>`).join('')}</div></section><footer><button type="button" class="button secondary" data-onboarding-action="skip">Plus tard</button><button type="button" class="button primary" data-onboarding-action="save">Continuer</button></footer></form>`;
    dialog.querySelector('[data-onboarding-action="skip"]').addEventListener('click',()=>{window.SigmaOnboardingStateV1.skip();dialog.close();});
    dialog.querySelector('[data-onboarding-action="save"]').addEventListener('click',()=>{
      const life=checked('sigma-life-profile');
      let support=checked('sigma-support-profile');
      if(support.includes('none'))support=[];
      window.SigmaActiveProfileStoreV1.replace(life,support);
      window.SigmaOnboardingStateV1.write({selectedLifeProfiles:life,selectedSupportProfiles:support});
      window.SigmaOnboardingStateV1.complete();
      dialog.close();
      window.SigmaCompactContextProfilesV1?.render?.();
    });
    dialog.showModal?.();
    return true;
  }
  function boot(){
    ensure();
    window.addEventListener('sigma:open-life-support-onboarding',open);
    window.SigmaSignupOnboardingTriggerV1.bind();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
  g.SigmaOnboardingUIV1={ensure,open,boot};
})(window);
