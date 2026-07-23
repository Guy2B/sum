'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root){root.SigmaIntelligenceV1=root.SigmaIntelligenceV1||{};root.SigmaIntelligenceV1.RelationshipService=api;}})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const clean=v=>String(v||'').trim().toLowerCase();
 const words=v=>new Set(clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(x=>x.length>3));
 function overlap(a,b){const left=words(a),right=words(b);if(!left.size||!right.size)return 0;let common=0;left.forEach(x=>{if(right.has(x))common+=1;});return common/Math.max(left.size,right.size);}
 function relation(entity,type,confidence,evidence){return{id:String(entity.id||entity.email||entity.name||entity.title||''),label:String(entity.name||entity.title||entity.email||''),type,confidence:Math.round(confidence*100)/100,evidence};}
 function resolve(signal,state={}){const text=[signal.content.title,signal.content.summary,signal.content.body,signal.content.sender].join(' ');const contacts=[],companies=[],projects=[],objectives=[];
  const sender=clean(signal.content.sender);
  for(const row of state.contacts||[]){const email=clean(row.email),name=clean(row.name||row.displayName);if(email&&sender.includes(email))contacts.push(relation(row,'contact',1,'sender:email'));else if(name&&sender.includes(name))contacts.push(relation(row,'contact',.9,'sender:name'));}
  for(const row of state.companies||[]){const domain=clean(row.domain),name=clean(row.name);if(domain&&clean(text).includes(domain))companies.push(relation(row,'company',.95,'text:domain'));else if(name&&clean(text).includes(name))companies.push(relation(row,'company',.82,'text:name'));}
  for(const row of state.projects||[]){const score=overlap(text,`${row.title||row.name||''} ${row.description||''}`);if(score>=.25)projects.push(relation(row,'project',Math.min(.9,.5+score),'text:similarity'));}
  const goalRows=[...(state.goals||[]),...(state.contextProfile?.primaryGoal?[{id:'primary-goal',title:state.contextProfile.primaryGoal}]:[])];
  for(const row of goalRows){const score=overlap(text,`${row.title||row.name||''} ${row.description||''}`);if(score>=.25)objectives.push(relation(row,'objective',Math.min(.9,.5+score),'text:similarity'));}
  return{contacts:contacts.slice(0,5),companies:companies.slice(0,5),projects:projects.sort((a,b)=>b.confidence-a.confidence).slice(0,5),objectives:objectives.sort((a,b)=>b.confidence-a.confidence).slice(0,5)};
 }
 return Object.freeze({resolve,overlap});
});
