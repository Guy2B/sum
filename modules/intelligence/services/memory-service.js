'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root){root.SigmaIntelligenceV1=root.SigmaIntelligenceV1||{};root.SigmaIntelligenceV1.MemoryService=api;}})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const MIN_OBSERVATIONS=3;
 const safe=(v,max=120)=>String(v??'').trim().slice(0,max);
 function derive(events,options={}){
  const rows=Array.isArray(events)?events:[],counts=new Map(),accepted=new Map(),rejected=new Map();
  for(const row of rows){const action=safe(row?.action||row?.data?.action),provider=safe(row?.provider||row?.data?.provider),category=safe(row?.category||row?.data?.category),hour=Number(row?.hour??new Date(row?.createdAt||0).getHours());
   for(const [kind,value] of [['action',action],['provider',provider],['category',category],['hour',Number.isFinite(hour)?String(hour):'']])if(value){const key=`${kind}:${value}`;counts.set(key,(counts.get(key)||0)+1);}
   if(action&&String(row?.type||'').includes('approved'))accepted.set(action,(accepted.get(action)||0)+1);
   if(action&&String(row?.type||'').includes('rejected'))rejected.set(action,(rejected.get(action)||0)+1);
  }
  const memories=[];for(const [key,count] of counts){if(count<MIN_OBSERVATIONS)continue;const [kind,...rest]=key.split(':'),value=rest.join(':');memories.push({id:key,type:kind,value,observationCount:count,confidence:Math.min(.95,.5+count*.05),evidenceCount:count,source:'observed_history',lastDerivedAt:new Date(options.now||Date.now()).toISOString()});}
  for(const action of new Set([...accepted.keys(),...rejected.keys()])){const yes=accepted.get(action)||0,no=rejected.get(action)||0,total=yes+no;if(total<MIN_OBSERVATIONS)continue;memories.push({id:`action_acceptance:${action}`,type:'action_acceptance',value:action,observationCount:total,confidence:Math.min(.95,.55+total*.04),acceptanceRate:yes/total,evidenceCount:total,source:'observed_history',lastDerivedAt:new Date(options.now||Date.now()).toISOString()});}
  return memories.sort((a,b)=>b.confidence-a.confidence||b.observationCount-a.observationCount||a.id.localeCompare(b.id));
 }
 function apply(signal,memories){const list=Array.isArray(memories)?memories:[];let adjustment=0;const factors=[];for(const memory of list){if(memory.type==='provider'&&memory.value===signal?.source?.provider){adjustment+=3;factors.push('frequent_provider');}if(memory.type==='category'&&memory.value===signal?.intelligence?.category){adjustment+=2;factors.push('frequent_category');}if(memory.type==='action_acceptance'&&memory.value===signal?.recommendation?.action&&memory.acceptanceRate>=.75){adjustment+=3;factors.push('usually_accepted_action');}}
  return{adjustment:Math.min(8,adjustment),factors:[...new Set(factors)],usedMemoryIds:list.filter(m=>factors.length&&['provider','category','action_acceptance'].includes(m.type)).map(m=>m.id).slice(0,10)};
 }
 return Object.freeze({MIN_OBSERVATIONS,derive,apply});
});
