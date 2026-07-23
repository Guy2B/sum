'use strict';
const crypto=require('crypto');
const DOMAINS=new Set(['mail','social','task','calendar','opportunity']);
const STATUSES=new Set(['new','reviewed','acted','ignored','archived']);
const ACTIONS=new Set(['read','reply','schedule','create_task','create_reminder','create_opportunity','prepare_meeting','create_content_idea','ignore','archive']);
const CATEGORIES=new Set(['communication','opportunity','administration','execution','calendar','content','relationship','risk','information','wellbeing']);
const text=(v,max=5000)=>String(v??'').trim().slice(0,max);
const iso=v=>{if(!v)return null;const d=new Date(v);return Number.isFinite(d.getTime())?d.toISOString():null;};
const score=v=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));
const list=(value,max=20)=>Array.isArray(value)?value.slice(0,max):[];
function docId(signalId){return crypto.createHash('sha256').update(String(signalId)).digest('hex');}
function cleanEntity(row,type){if(!row||typeof row!=='object')return null;return{id:text(row.id,300),label:text(row.label||row.name||row.title||row.email,300),type,confidence:Math.max(0,Math.min(1,Number(row.confidence)||0)),matchType:text(row.matchType,30)||'inferred',evidence:list(row.evidence,10).map(v=>text(v,300)).filter(Boolean)};}
function cleanSignal(raw,uid){
 if(!raw||typeof raw!=='object')throw new Error('Invalid signal');
 const id=text(raw.id,300);if(!id)throw new Error('Signal id is required');
 const source=raw.source||{},domain=text(source.domain,40);if(!DOMAINS.has(domain))throw new Error('Invalid signal domain');
 const sourceId=text(source.sourceId,300);if(!sourceId)throw new Error('Signal sourceId is required');
 const intelligence=raw.intelligence||{},recommendation=raw.recommendation||{};
 const category=CATEGORIES.has(intelligence.category)?intelligence.category:'information';
 const action=ACTIONS.has(recommendation.action)?recommendation.action:'read';
 const entities={};for(const [plural,type] of [['contacts','contact'],['companies','company'],['projects','project'],['objectives','objective']])entities[plural]=list(raw.entities?.[plural],5).map(x=>cleanEntity(x,type)).filter(Boolean);
 entities.dates=list(raw.entities?.dates,10).map(x=>({role:text(x?.role,40),value:iso(x?.value),dateType:text(x?.dateType,30)||'explicit',confidence:Math.max(0,Math.min(1,Number(x?.confidence)||1))})).filter(x=>x.value);
 return{id,userId:uid,schemaVersion:1,source:{domain,provider:text(source.provider,60)||'sigma',sourceType:text(source.sourceType,60)||domain,sourceId,accountId:text(source.accountId,300),sourceUrl:text(source.sourceUrl,1200),importedAt:iso(source.importedAt)||new Date().toISOString(),sourceUpdatedAt:iso(source.sourceUpdatedAt)},content:{title:text(raw.content?.title,500),summary:text(raw.content?.summary,2000),body:text(raw.content?.body,20000),sender:text(raw.content?.sender,500),recipients:list(raw.content?.recipients,50).map(x=>text(x,500)).filter(Boolean),receivedAt:iso(raw.content?.receivedAt)||new Date().toISOString(),language:text(raw.content?.language,12)||'und'},entities,intelligence:{category,subcategory:text(intelligence.subcategory,80),importance:{score:score(intelligence.importance?.score),reasons:list(intelligence.importance?.reasons,20).map(x=>text(x,120))},urgency:{score:score(intelligence.urgency?.score),dueAt:iso(intelligence.urgency?.dueAt),reasons:list(intelligence.urgency?.reasons,20).map(x=>text(x,120))},impact:{score:score(intelligence.impact?.score),reasons:list(intelligence.impact?.reasons,20).map(x=>text(x,120))},confidence:{score:score(intelligence.confidence?.score),reasons:list(intelligence.confidence?.reasons,20).map(x=>text(x,120))},priorityScore:score(intelligence.priorityScore),priorityBand:text(intelligence.priorityBand,20),effortMinutes:Math.max(1,Math.min(1440,Number(intelligence.effortMinutes)||20)),replyExpected:Boolean(intelligence.replyExpected),replyExpectedBy:iso(intelligence.replyExpectedBy),classifiedAt:iso(intelligence.classifiedAt),engineVersion:text(intelligence.engineVersion,60)},recommendation:{action,label:text(recommendation.label,300)||action,rationaleCodes:list(recommendation.rationaleCodes,20).map(x=>text(x,120)),dueAt:iso(recommendation.dueAt),requiresApproval:Boolean(recommendation.requiresApproval),sensitivity:text(recommendation.sensitivity,30),alternatives:list(recommendation.alternatives,5).map(x=>text(x,80))},relationships:{parentSignalId:text(raw.relationships?.parentSignalId,300),relatedSignalIds:list(raw.relationships?.relatedSignalIds,20).map(x=>text(x,300)),threadId:text(raw.relationships?.threadId,300),deduplicationKey:text(raw.relationships?.deduplicationKey,800)||`${domain}|${text(source.provider,60)}|${sourceId}`},status:STATUSES.has(raw.status)?raw.status:'new',createdAt:iso(raw.createdAt)||new Date().toISOString(),updatedAt:new Date().toISOString(),storeVersion:'5.1.0'};
}
module.exports={DOMAINS,STATUSES,ACTIONS,CATEGORIES,docId,cleanSignal};
