'use strict';
(() => {
  function report(){const engine=window.SigmaSocialEngine;const storage=window.SigmaSocialStorage;const model=window.SigmaSocialModel;return{version:'4.9.2',model:Boolean(model),storage:Boolean(storage),engine:Boolean(engine),providers:engine?.listProviders?.()||[],summary:storage?.summary?.()||{},firebase:Boolean(window.SigmaCloud?.configured),online:navigator.onLine};}
  function show(){const r=report();const providers=r.providers.map(p=>`${p.name}: ${p.configured?'prêt':'configuration requise'}`).join('\n')||'Aucun adaptateur enregistré';alert(`Sigma Social Engine ${r.version}\n\nModèle: ${r.model?'OK':'ERREUR'}\nStockage: ${r.storage?'OK':'ERREUR'}\nMoteur: ${r.engine?'OK':'ERREUR'}\nFirebase: ${r.firebase?'OK':'non connecté'}\nRéseau: ${r.online?'en ligne':'hors ligne'}\n\n${providers}`);return r;}
  window.SigmaSocialDiagnostics=Object.freeze({version:'4.9.2',report,show});
})();
