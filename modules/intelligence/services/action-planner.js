'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root){root.SigmaIntelligenceV1=root.SigmaIntelligenceV1||{};root.SigmaIntelligenceV1.ActionPlanner=api;}})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const EXTERNAL=new Set(['reply','schedule']);
 const INTERNAL=new Set(['read','create_task','create_reminder','create_opportunity','prepare_meeting','create_content_idea','ignore','archive']);
 const text=(v,max=1000)=>String(v??'').trim().slice(0,max);
 function plan(signal,action){const selected=action||signal?.recommendation?.action||'read',dueAt=signal?.recommendation?.dueAt||signal?.intelligence?.urgency?.dueAt||null,title=text(signal?.content?.title||signal?.recommendation?.label||'Action Sigma',300),summary=text(signal?.content?.summary||signal?.content?.body,1000);
  const base={action:selected,signalId:text(signal?.id,300),title,summary,dueAt,requiresApproval:selected!=='read',executionClass:EXTERNAL.has(selected)?'external_sensitive':'internal_controlled',payload:{sourceSignalId:text(signal?.id,300),title,notes:summary,dueAt}};
  if(selected==='reply')base.payload={...base.payload,draftOnly:true,recipient:text(signal?.content?.sender,300)};
  if(selected==='schedule'||selected==='prepare_meeting')base.payload={...base.payload,calendarWrite:false,attendees:signal?.content?.recipients||[]};
  if(selected==='create_content_idea')base.payload={...base.payload,publish:false};
  return base;
 }
 return Object.freeze({EXTERNAL,INTERNAL,plan});
});
