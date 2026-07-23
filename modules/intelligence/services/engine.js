'use strict';
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;if(root){root.SigmaIntelligenceV1=root.SigmaIntelligenceV1||{};root.SigmaIntelligenceV1.Engine=api;}})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 function deps(){
  if(typeof module==='object'&&module.exports)return{
   normalizer:require('./normalization-service.js'),classifier:require('./classification-service.js'),priority:require('./priority-service.js'),recommendation:require('./recommendation-service.js'),relationships:require('./relationship-service.js'),explanation:require('./explanation-service.js'),memory:require('./memory-service.js'),today:require('./today-service.js')
  };
  return{normalizer:root.SigmaIntelligenceV1.NormalizationService,classifier:root.SigmaIntelligenceV1.ClassificationService,priority:root.SigmaIntelligenceV1.PriorityService,recommendation:root.SigmaIntelligenceV1.RecommendationService,relationships:root.SigmaIntelligenceV1.RelationshipService,explanation:root.SigmaIntelligenceV1.ExplanationService,memory:root.SigmaIntelligenceV1.MemoryService,today:root.SigmaIntelligenceV1.TodayService};
 }
 function analyzeWorkspace(state,options={}){
  const d=deps(),signals=d.normalizer.normalizeWorkspace(state,options);
  return signals.map(signal=>{
   const classification=d.classifier.classify(signal);
   const entities=d.relationships.resolve(signal,state);
   const relatedSignal={...signal,entities:{...signal.entities,...entities}};
   let intelligence=d.priority.score(relatedSignal,classification,options);const memoryEffect=d.memory?.apply?d.memory.apply({...relatedSignal,intelligence},options.memories||[]):{adjustment:0,factors:[]};if(memoryEffect.adjustment){intelligence={...intelligence,priorityScore:Math.min(100,intelligence.priorityScore+memoryEffect.adjustment),memoryAdjustment:memoryEffect.adjustment,memoryFactors:memoryEffect.factors};}
   const recommendation=d.recommendation.recommend(relatedSignal,intelligence);
   const enriched={...relatedSignal,intelligence,recommendation,approval:{...signal.approval,status:recommendation.requiresApproval?'pending':'not_required'}};
   return{...enriched,explanation:d.explanation.explain(enriched)};
  }).sort((a,b)=>b.intelligence.priorityScore-a.intelligence.priorityScore||String(b.content.receivedAt).localeCompare(String(a.content.receivedAt)));
 }
 function buildToday(state,options={}){const d=deps(),signals=analyzeWorkspace(state,options);return d.today.select(signals,options);}
 return Object.freeze({version:'5.6.0',analyzeWorkspace,buildToday});
});
