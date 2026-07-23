'use strict';
(()=>{
 const api={
  available(){return Boolean(window.SigmaCloud?.user&&window.SigmaCloud?.callFunction);},
  async sync(signals){if(!api.available())return{skipped:true,reason:'cloud_unavailable'};const payload=signals.map(s=>JSON.parse(JSON.stringify(s)));return window.SigmaCloud.callFunction('syncIntelligenceSignals',{signals:payload});},
  async listToday(limit=20){if(!window.SigmaCloud?.user||!window.SigmaCloud?.db)return[];const {collection,query,where,orderBy,limit:limitFn,getDocs}=window.SigmaCloud.api;const ref=collection(window.SigmaCloud.db,'users',window.SigmaCloud.user.uid,'signals');const snap=await getDocs(query(ref,where('status','==','new'),orderBy('intelligence.priorityScore','desc'),limitFn(limit)));return snap.docs.map(d=>({id:d.id,...d.data()}));}
 };
 window.SigmaIntelligenceV1=window.SigmaIntelligenceV1||{};window.SigmaIntelligenceV1.SignalRepository=Object.freeze(api);
})();
