'use strict';
(() => {
  const ENGINE_KEY = 'sigma.social.engine.v492';
  const isDemo = value => Boolean(value && (value.demo === true || /\bdemo\b/i.test(String(value.label || value.displayName || value.title || ''))));
  function cleanEngine() {
    try {
      const raw = localStorage.getItem(ENGINE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const demoAccountIds = new Set((data.accounts || []).filter(isDemo).map(x => x.id));
      let changed = false;
      for (const key of ['accounts','posts','messages','comments','metrics','notifications','scheduledPosts']) {
        const before = Array.isArray(data[key]) ? data[key] : [];
        const after = before.filter(x => !isDemo(x) && !demoAccountIds.has(x.accountId));
        if (after.length !== before.length) changed = true;
        data[key] = after;
      }
      if (changed) {
        data.updatedAt = new Date().toISOString();
        localStorage.setItem(ENGINE_KEY, JSON.stringify(data));
      }
    } catch (error) { console.warn('[Sigma Social 4.9.5] engine cleanup skipped', error); }
  }
  function cleanLegacy() {
    for (let i=0;i<localStorage.length;i++) {
      const key=localStorage.key(i); if (!key || key===ENGINE_KEY) continue;
      try {
        const data=JSON.parse(localStorage.getItem(key));
        if (!data || typeof data!=='object' || !Array.isArray(data.socialAccounts)) continue;
        const ids=new Set(data.socialAccounts.filter(isDemo).map(x=>x.id));
        data.socialAccounts=data.socialAccounts.filter(x=>!isDemo(x));
        if (Array.isArray(data.socialInteractions)) data.socialInteractions=data.socialInteractions.filter(x=>!isDemo(x)&&!ids.has(x.accountId));
        localStorage.setItem(key,JSON.stringify(data));
      } catch (_) {}
    }
  }
  function renderReality() {
    const summary=window.SigmaSocialStorage?.summary?.()||{};
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=String(v??0);};
    set('social-kpi-accounts',summary.accounts||0);
    set('social-kpi-priority',summary.priority||0);
    set('social-kpi-replies',summary.replies??summary.pending??0);
    set('social-kpi-comments',summary.comments||0);
    const label=document.getElementById('social-mode-label'); if(label) label.textContent=(summary.accounts||0)?'CONNECTÉ':'RÉEL';
    const demo=document.getElementById('social-info-demo'); if(demo){demo.hidden=true;demo.disabled=true;}
    document.querySelectorAll('.social-account-chip').forEach(el=>{if(/demo/i.test(el.textContent||''))el.remove();});
  }
  function boot(){cleanEngine();cleanLegacy();renderReality();window.dispatchEvent(new CustomEvent('sigma:social-engine-updated'));}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
  window.addEventListener('sigma:social-engine-updated',renderReality);
  window.SigmaSocialReality=Object.freeze({version:'4.9.5',clean:boot});
})();
