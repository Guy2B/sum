'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root){root.SigmaIntelligenceV1=root.SigmaIntelligenceV1||{};root.SigmaIntelligenceV1.RelationshipService=api;}})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const VERSION='2.0.0';
 const clean=v=>String(v||'').trim().toLowerCase();
 const ascii=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const tokens=v=>new Set(ascii(v).replace(/[^a-z0-9@._+-]+/g,' ').split(/\s+/).filter(x=>x.length>2));
 const emailFrom=v=>{const match=String(v||'').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);return match?clean(match[0]):'';};
 const domainFrom=v=>{const email=emailFrom(v)||clean(v);const at=email.lastIndexOf('@');return at>=0?email.slice(at+1).replace(/^www\./,''):email.replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0];};
 function overlap(a,b){const left=tokens(a),right=tokens(b);if(!left.size||!right.size)return 0;let common=0;left.forEach(x=>{if(right.has(x))common+=1;});return common/Math.max(left.size,right.size);}
 function relation(entity,type,confidence,evidence,matchType='inferred'){
  const id=String(entity.id||entity.email||entity.domain||entity.name||entity.title||'');
  return{id,label:String(entity.name||entity.title||entity.displayName||entity.email||entity.domain||''),type,confidence:Math.round(confidence*100)/100,matchType,evidence:Array.isArray(evidence)?evidence:[evidence].filter(Boolean)};
 }
 function unique(rows){const seen=new Map();for(const row of rows){const key=`${row.type}:${row.id}`;const prev=seen.get(key);if(!prev||row.confidence>prev.confidence)seen.set(key,row);}return [...seen.values()].sort((a,b)=>b.confidence-a.confidence||a.label.localeCompare(b.label));}
 function resolve(signal,state={}){
  const text=[signal.content?.title,signal.content?.summary,signal.content?.body,signal.content?.sender].join(' ');
  const normalizedText=ascii(text);const senderEmail=emailFrom(signal.content?.sender);const senderDomain=domainFrom(senderEmail);
  const contacts=[],companies=[],projects=[],objectives=[];
  for(const row of state.contacts||[]){
   const rowEmail=clean(row.email||row.primaryEmail);const rowName=ascii(row.name||row.displayName||row.fullName);
   if(rowEmail&&senderEmail===rowEmail)contacts.push(relation(row,'contact',1,['sender.email:exact'],'exact'));
   else if(rowName&&ascii(signal.content?.sender).includes(rowName))contacts.push(relation(row,'contact',.92,['sender.name:exact'],'exact'));
   else {const score=overlap(text,`${row.name||row.displayName||''} ${row.company||''}`);if(score>=.42)contacts.push(relation(row,'contact',Math.min(.78,.45+score/2),[`text.similarity:${score.toFixed(2)}`]));}
  }
  for(const row of state.companies||[]){
   const rowDomain=domainFrom(row.domain||row.website);const rowName=ascii(row.name);
   if(rowDomain&&senderDomain&&rowDomain===senderDomain)companies.push(relation(row,'company',.99,['sender.domain:exact'],'exact'));
   else if(rowDomain&&normalizedText.includes(rowDomain))companies.push(relation(row,'company',.95,['text.domain:exact'],'exact'));
   else if(rowName&&normalizedText.includes(rowName))companies.push(relation(row,'company',.86,['text.name:exact'],'exact'));
  }
  for(const row of state.projects||[]){
   const score=overlap(text,`${row.title||row.name||''} ${row.description||''} ${(row.tags||[]).join(' ')}`);
   const explicitId=String(signal.facts?.projectId||'')===String(row.id||'');
   if(explicitId)projects.push(relation(row,'project',1,['source.projectId:exact'],'exact'));
   else if(score>=.20)projects.push(relation(row,'project',Math.min(.9,.48+score),[`text.similarity:${score.toFixed(2)}`]));
  }
  const goalRows=[...(state.goals||[]),...(state.objectives||[]),...(state.contextProfile?.primaryGoal?[{id:'primary-goal',title:state.contextProfile.primaryGoal}]:[])];
  for(const row of goalRows){
   const score=overlap(text,`${row.title||row.name||''} ${row.description||''} ${(row.tags||[]).join(' ')}`);
   const explicitId=String(signal.facts?.objectiveId||'')===String(row.id||'');
   if(explicitId)objectives.push(relation(row,'objective',1,['source.objectiveId:exact'],'exact'));
   else if(score>=.20)objectives.push(relation(row,'objective',Math.min(.9,.48+score),[`text.similarity:${score.toFixed(2)}`]));
  }
  return{contacts:unique(contacts).slice(0,5),companies:unique(companies).slice(0,5),projects:unique(projects).slice(0,5),objectives:unique(objectives).slice(0,5),resolution:{version:VERSION,resolvedAt:new Date().toISOString()}};
 }
 function buildGraph(signals=[]){
  const nodes=new Map(),edges=[];
  for(const signal of signals){nodes.set(`signal:${signal.id}`,{id:`signal:${signal.id}`,type:'signal',label:signal.content?.title||signal.id});for(const type of ['contacts','companies','projects','objectives'])for(const entity of signal.entities?.[type]||[]){const nodeId=`${entity.type||type.replace(/s$/,'')}:${entity.id}`;nodes.set(nodeId,{id:nodeId,type:entity.type||type.replace(/s$/,''),label:entity.label||entity.id});edges.push({id:`${signal.id}|${nodeId}`,from:`signal:${signal.id}`,to:nodeId,type:'related_to',confidence:entity.confidence,matchType:entity.matchType,evidence:entity.evidence});}}
  return{version:VERSION,nodes:[...nodes.values()],edges};
 }
 return Object.freeze({VERSION,resolve,buildGraph,overlap,emailFrom,domainFrom});
});
