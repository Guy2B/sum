'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root){root.SigmaIntelligenceV1=root.SigmaIntelligenceV1||{};root.SigmaIntelligenceV1.SignalSchema=api;}})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const SCHEMA_VERSION=1;
  const DOMAINS=Object.freeze(['mail','social','task','calendar','opportunity']);
  const STATUSES=Object.freeze(['new','reviewed','acted','ignored','archived']);
  const ACTIONS=Object.freeze(['read','reply','schedule','create_task','create_reminder','create_opportunity','prepare_meeting','create_content_idea','ignore','archive']);
  const CATEGORIES=Object.freeze(['communication','opportunity','administration','execution','calendar','content','relationship','risk','information','wellbeing']);
  const APPROVAL_STATUSES=Object.freeze(['not_required','pending','approved','rejected']);
  const EXECUTION_STATUSES=Object.freeze(['not_started','queued','completed','failed']);
  const text=v=>String(v??'').trim();
  const iso=v=>{if(!v)return null;const d=new Date(v);return Number.isFinite(d.getTime())?d.toISOString():null;};
  function create(input={}){
    const now=new Date().toISOString(),source=input.source||{},content=input.content||{},entities=input.entities||{};
    const sourceId=text(source.sourceId||input.sourceId),domain=text(source.domain||input.sourceType);
    return {
      id:text(input.id)||`${domain||'signal'}:${text(source.provider)||'sigma'}:${sourceId||Math.random().toString(36).slice(2)}`,
      schemaVersion:SCHEMA_VERSION,userId:text(input.userId),
      source:{domain,provider:text(source.provider)||'sigma',sourceType:text(source.sourceType)||domain,sourceId,accountId:text(source.accountId),sourceUrl:text(source.sourceUrl),importedAt:iso(source.importedAt)||now,sourceUpdatedAt:iso(source.sourceUpdatedAt)},
      content:{title:text(content.title),summary:text(content.summary),body:text(content.body),sender:text(content.sender),recipients:Array.isArray(content.recipients)?content.recipients.map(text).filter(Boolean):[],receivedAt:iso(content.receivedAt)||now,language:text(content.language)||'und'},
      entities:{contacts:Array.isArray(entities.contacts)?entities.contacts:[],companies:Array.isArray(entities.companies)?entities.companies:[],projects:Array.isArray(entities.projects)?entities.projects:[],objectives:Array.isArray(entities.objectives)?entities.objectives:[],dates:Array.isArray(entities.dates)?entities.dates:[]},
      intelligence:input.intelligence||null,recommendation:input.recommendation||null,
      approval:input.approval||{status:'not_required',approvedAt:null,approvedBy:'',rejectionReason:''},
      execution:input.execution||{status:'not_started',executedAt:null,resultReference:'',errorCode:''},
      relationships:{parentSignalId:text(input.relationships?.parentSignalId),relatedSignalIds:Array.isArray(input.relationships?.relatedSignalIds)?input.relationships.relatedSignalIds:[],threadId:text(input.relationships?.threadId),deduplicationKey:text(input.relationships?.deduplicationKey)||`${domain}|${text(source.provider)}|${sourceId}`},
      status:STATUSES.includes(input.status)?input.status:'new',createdAt:iso(input.createdAt)||now,updatedAt:iso(input.updatedAt)||now
    };
  }
  return Object.freeze({SCHEMA_VERSION,DOMAINS,STATUSES,ACTIONS,CATEGORIES,APPROVAL_STATUSES,EXECUTION_STATUSES,create});
});
