'use strict';
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;if(root){root.SigmaIntelligenceV1=root.SigmaIntelligenceV1||{};root.SigmaIntelligenceV1.Engine=api;}})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 function deps(){
  if(typeof module==='object'&&module.exports)return{
   normalizer:require('./normalization-service.js'),classifier:require('./classification-service.js'),priority:require('./priority-service.js'),recommendation:require('./recommendation-service.js'),relationships:require('./relationship-service.js'),explanation:require('./explanation-service.js')
  };
  return{normalizer:root.SigmaIntelligenceV1.NormalizationService,classifier:root.SigmaIntelligenceV1.ClassificationService,priority:root.SigmaIntelligenceV1.PriorityService,recommendation:root.SigmaIntelligenceV1.RecommendationService,relationships:root.SigmaIntelligenceV1.RelationshipService,explanation:root.SigmaIntelligenceV1.ExplanationService};
 }
 function analyzeWorkspace(state,options={}){
  const d=deps(),signals=d.normalizer.normalizeWorkspace(state,options);
  return signals.map(signal=>{
   const classification=d.classifier.classify(signal);
   const intelligence=d.priority.score(signal,classification);
   const recommendation=d.recommendation.recommend(signal,intelligence);
   const entities=d.relationships.resolve(signal,state);
   const enriched={...signal,entities:{...signal.entities,...entities},intelligence,recommendation,approval:{...signal.approval,status:recommendation.requiresApproval?'pending':'not_required'}};
   return{...enriched,explanation:d.explanation.explain(enriched)};
  }).sort((a,b)=>b.intelligence.priorityScore-a.intelligence.priorityScore||String(b.content.receivedAt).localeCompare(String(a.content.receivedAt)));
 }
 return Object.freeze({version:'1.2.0-phases-3-7',analyzeWorkspace});
});
