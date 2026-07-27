'use strict';
(function (root) {
  const state = { lastReconcileAt: null, replacedIdentityNodes: 0, hiddenDemoNodes: 0, removedDefaultTaskNodes: 0 };
  const DEFAULT_TASK_PATTERNS = [/finaliser le devis martin/i,/rendez-vous client/i,/préparer la semaine prochaine/i];
  function currentUser(){return root.SigmaCloud?.auth?.currentUser||root.SigmaCloud?.user||root.firebase?.auth?.()?.currentUser||null;}
  function effectiveName(){const u=currentUser();const n=String(u?.displayName||'').trim();if(n&&!/^alex$/i.test(n))return n;const e=String(u?.email||'');const p=e.includes('@')?e.split('@')[0]:'';return /^alex$/i.test(p)?'':p;}
  function replaceVisibleAlex(){const n=effectiveName();if(!n)return 0;let c=0;document.querySelectorAll('body *').forEach(x=>{if(x.children.length)return;const t=String(x.textContent||'');if(!/\\bAlex\\b/i.test(t))return;x.textContent=t.replace(/\\bAlex\\b/gi,n);c++;});return c;}
  function hideDemoMarkers(){if(!currentUser())return 0;let c=0;document.querySelectorAll('body *').forEach(x=>{if(x.children.length)return;const t=String(x.textContent||'').trim();if(/^(demo|beta|admin beta)$/i.test(t)){x.hidden=true;x.setAttribute('aria-hidden','true');c++;}});return c;}
  function hideDefaultTasks(){if(!currentUser())return 0;let c=0;document.querySelectorAll('article,li,[role="listitem"],.card,.task-card,[data-task-id]').forEach(x=>{const t=String(x.textContent||'');if(!DEFAULT_TASK_PATTERNS.some(p=>p.test(t)))return;x.hidden=true;x.setAttribute('aria-hidden','true');x.dataset.wave01DefaultTaskHidden='true';c++;});return c;}
  function reconcile(){state.lastReconcileAt=new Date().toISOString();state.replacedIdentityNodes+=replaceVisibleAlex();state.hiddenDemoNodes+=hideDemoMarkers();state.removedDefaultTaskNodes+=hideDefaultTasks();document.documentElement.dataset.sigmaDataMode=currentUser()?'authenticated':'anonymous';}
  function scanDocument(){const t=String(document.body?.innerText||'');return{alexOccurrences:(t.match(/\\bAlex\\b/gi)||[]).length,demoOccurrences:(t.match(/\\bDEMO\\b/gi)||[]).length,betaOccurrences:(t.match(/\\bBETA\\b/gi)||[]).length,defaultTaskOccurrences:DEFAULT_TASK_PATTERNS.reduce((a,p)=>a+(p.test(t)?1:0),0)};}
  root.SigmaWave01TruthData={currentUser,effectiveName,reconcile,scanDocument,diagnostics(){return{ok:true,authenticated:Boolean(currentUser()),uid:currentUser()?.uid||null,firebaseDisplayName:currentUser()?.displayName||null,effectiveName:effectiveName()||null,state:{...state},visibleScan:scanDocument()};}};
  const start=()=>{reconcile();new MutationObserver(()=>queueMicrotask(reconcile)).observe(document.documentElement,{childList:true,subtree:true});root.SigmaCloud?.auth?.onAuthStateChanged?.(()=>setTimeout(reconcile,0));};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})(globalThis);
