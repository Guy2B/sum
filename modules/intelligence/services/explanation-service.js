'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root){root.SigmaIntelligenceV1=root.SigmaIntelligenceV1||{};root.SigmaIntelligenceV1.ExplanationService=api;}})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const LABELS={
  'source:important':'La source marque ce signal comme important.',
  'source:essential':'Ce signal est identifié comme essentiel.',
  'source:urgent':'La source marque ce signal comme urgent.',
  'reply:expected':'Une réponse semble attendue.',
  'category:opportunity':'Le contenu présente des marqueurs d’opportunité.',
  'category:risk':'Le contenu présente des marqueurs de risque.'
 };
 function factor(code){if(code.startsWith('due:')){const delta=Number(code.slice(4));return{code,label:delta<0?'L’échéance semble dépassée.':delta===0?'Une échéance est prévue aujourd’hui.':`Une échéance est prévue dans ${delta} jour${delta>1?'s':''}.`,evidence:code};}if(code.startsWith('category:'))return{code,label:LABELS[code]||`Le signal est classé « ${code.slice(9)} ».`,evidence:code};return{code,label:LABELS[code]||code,evidence:code};}
 function explain(signal){const codes=signal.recommendation?.rationaleCodes||[];const factors=[...new Set(codes)].map(factor);const uncertainty=[];const confidence=signal.intelligence?.confidence?.score??0;if(confidence<70)uncertainty.push('La classification reste incertaine et mérite une vérification humaine.');if(!signal.content.body&&!signal.content.summary)uncertainty.push('Le moteur ne dispose que d’un contenu limité.');
  return{summary:`${signal.recommendation?.label||'Examiner'} — priorité ${signal.intelligence?.priorityScore||0}/100.`,factors:factors.slice(0,5),uncertainty,confidence};
 }
 return Object.freeze({explain});
});
