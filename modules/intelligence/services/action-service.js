'use strict';
(()=>{
 const SENSITIVE=new Set(['reply','schedule','create_task','create_reminder','create_opportunity','prepare_meeting','create_content_idea','ignore','archive']);
 async function request(signal,action){if(!signal?.id)throw new Error('Signal manquant');const selected=action||signal.recommendation?.action||'read',plan=window.SigmaIntelligenceV1.ActionPlanner?.plan(signal,selected);if(!SENSITIVE.has(selected))return{status:'not_required',action:selected,plan};if(!window.SigmaCloud?.callFunction)throw new Error('Connexion cloud requise pour valider cette action');return window.SigmaCloud.callFunction('createIntelligenceActionRequest',{signalId:signal.id,action:selected,label:signal.recommendation?.label||selected,proposal:plan});}
 async function approve(requestId){return window.SigmaCloud.callFunction('approveIntelligenceAction',{requestId});}
 async function reject(requestId,reason=''){return window.SigmaCloud.callFunction('rejectIntelligenceAction',{requestId,reason});}
 async function execute(requestId){return window.SigmaCloud.callFunction('executeApprovedIntelligenceAction',{requestId});}
 window.SigmaIntelligenceV1=window.SigmaIntelligenceV1||{};window.SigmaIntelligenceV1.ActionService=Object.freeze({SENSITIVE,request,approve,reject,execute});
})();
