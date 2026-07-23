'use strict';
(()=>{
 const api={
  available(){return Boolean(window.SigmaCloud?.user&&window.SigmaCloud?.db);},
  async listEntities(type='',limit=100){if(!api.available())return[];const {collection,query,where,limit:limitFn,getDocs}=window.SigmaCloud.api;const ref=collection(window.SigmaCloud.db,'users',window.SigmaCloud.user.uid,'entities');const q=type?query(ref,where('type','==',type),limitFn(limit)):query(ref,limitFn(limit));const snap=await getDocs(q);return snap.docs.map(d=>({docId:d.id,...d.data()}));},
  async relationsForSignal(signalId,limit=50){if(!api.available())return[];const {collection,query,where,limit:limitFn,getDocs}=window.SigmaCloud.api;const ref=collection(window.SigmaCloud.db,'users',window.SigmaCloud.user.uid,'signalRelations');const snap=await getDocs(query(ref,where('signalId','==',String(signalId)),limitFn(limit)));return snap.docs.map(d=>({docId:d.id,...d.data()}));}
 };
 window.SigmaIntelligenceV1=window.SigmaIntelligenceV1||{};window.SigmaIntelligenceV1.RelationshipRepository=Object.freeze(api);
})();
