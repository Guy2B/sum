'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root){root.SigmaIntelligenceV1=root.SigmaIntelligenceV1||{};root.SigmaIntelligenceV1.PriorityService=api;}})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const VERSION='2.0.0';
 const DEFAULT_WEIGHTS=Object.freeze({importance:.35,urgency:.30,impact:.25,confidence:.10});
 const clamp=n=>Math.max(0,Math.min(100,Math.round(Number(n)||0)));
 const toTime=v=>{const t=v?new Date(v).getTime():NaN;return Number.isFinite(t)?t:null;};
 const daysBetween=(value,now)=>{const target=toTime(value);if(target===null)return null;const a=new Date(now),b=new Date(target);const start=Date.UTC(a.getUTCFullYear(),a.getUTCMonth(),a.getUTCDate());const end=Date.UTC(b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate());return Math.round((end-start)/86400000);};
 function add(bucket,code,points,evidence=''){bucket.score+=points;bucket.factors.push({code,points,evidence});}
 function band(score){return score>=85?'critical':score>=70?'high':score>=50?'medium':'low';}
 function score(signal,classification,options={}){
  const now=toTime(options.now)||Date.now(),weights={...DEFAULT_WEIGHTS,...(options.weights||{})},raw=signal.facts||{};
  const due=(signal.entities?.dates||[]).find(d=>d.role==='due'||d.role==='start')?.value||null;
  const importance={score:30,factors:[]},urgency={score:15,factors:[]},impact={score:25,factors:[]};
  let confidence=clamp(classification?.confidence?.score??50);
  if(raw.importance==='high'||raw.important)add(importance,'source.important',35,'Source marked important');
  if(raw.essential)add(importance,'source.essential',20,'Source marked essential');
  if(raw.starred)add(importance,'source.starred',10,'Source starred');
  if(raw.urgent)add(urgency,'source.urgent',45,'Source marked urgent');
  const delta=daysBetween(due,now);
  if(delta!==null){if(delta<0)add(urgency,'deadline.overdue',65,`${Math.abs(delta)} day(s) overdue`);else if(delta===0)add(urgency,'deadline.today',55,'Due today');else if(delta<=2)add(urgency,'deadline.within_48h',38,`Due in ${delta} day(s)`);else if(delta<=7)add(urgency,'deadline.within_week',18,`Due in ${delta} day(s)`);else add(urgency,'deadline.known',5,`Due in ${delta} day(s)`);}
  const category=classification?.category||'information';
  if(category==='opportunity')add(impact,'category.opportunity',35,'Potential positive outcome');
  if(category==='risk'){add(impact,'category.risk',30,'Potential negative outcome');add(urgency,'category.risk',20,'Risk may require fast action');}
  if(category==='relationship')add(impact,'category.relationship',15,'Relationship value');
  const replyExpected=Boolean(raw.needsReply||raw.requiresReply||raw.replyExpected);
  if(replyExpected){add(urgency,'reply.expected',20,'A response appears expected');add(importance,'reply.expected',10,'Someone is waiting for the user');}
  const relationshipCount=['contacts','companies','projects','objectives'].reduce((n,k)=>n+(signal.entities?.[k]?.length||0),0);
  if(relationshipCount){add(importance,'relationships.linked',Math.min(15,relationshipCount*3),`${relationshipCount} linked entity/entities`);confidence=clamp(confidence+Math.min(10,relationshipCount*2));}
  importance.score=clamp(importance.score);urgency.score=clamp(urgency.score);impact.score=clamp(impact.score);
  const priorityScore=clamp(importance.score*weights.importance+urgency.score*weights.urgency+impact.score*weights.impact+confidence*weights.confidence);
  const formula={weights,components:{importance:importance.score,urgency:urgency.score,impact:impact.score,confidence},result:priorityScore};
  return{...classification,importance:{score:importance.score,reasons:importance.factors.map(x=>x.code),factors:importance.factors},urgency:{score:urgency.score,dueAt:due,reasons:urgency.factors.map(x=>x.code),factors:urgency.factors},impact:{score:impact.score,reasons:impact.factors.map(x=>x.code),factors:impact.factors},confidence:{...(classification?.confidence||{}),score:confidence},priorityScore,priorityBand:band(priorityScore),formula,effortMinutes:Math.max(1,Number(raw.estimate||raw.effortMinutes||20)),replyExpected,replyExpectedBy:null,classifiedAt:new Date(now).toISOString(),engineVersion:VERSION};
 }
 return Object.freeze({VERSION,DEFAULT_WEIGHTS,score,band,daysBetween});
});
