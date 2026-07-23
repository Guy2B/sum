'use strict';
const crypto=require('crypto');
const MIN_OBSERVATIONS=3;
const id=value=>crypto.createHash('sha256').update(String(value)).digest('hex');
function derive(events,now=Date.now()){
 const counts=new Map(),accepted=new Map(),rejected=new Map();
 for(const event of events){const action=String(event.action||''),provider=String(event.provider||''),category=String(event.category||'');for(const [type,value] of [['action',action],['provider',provider],['category',category]])if(value){const key=`${type}:${value}`;counts.set(key,(counts.get(key)||0)+1);}if(action&&String(event.type||'').includes('approved'))accepted.set(action,(accepted.get(action)||0)+1);if(action&&String(event.type||'').includes('rejected'))rejected.set(action,(rejected.get(action)||0)+1);}
 const out=[];for(const [key,count] of counts){if(count<MIN_OBSERVATIONS)continue;const [type,...value]=key.split(':');out.push({memoryKey:key,type,value:value.join(':'),observationCount:count,evidenceCount:count,confidence:Math.min(.95,.5+count*.05),source:'observed_history',derivedAt:new Date(now).toISOString()});}
 for(const action of new Set([...accepted.keys(),...rejected.keys()])){const yes=accepted.get(action)||0,no=rejected.get(action)||0,total=yes+no;if(total<MIN_OBSERVATIONS)continue;out.push({memoryKey:`action_acceptance:${action}`,type:'action_acceptance',value:action,observationCount:total,evidenceCount:total,acceptanceRate:yes/total,confidence:Math.min(.95,.55+total*.04),source:'observed_history',derivedAt:new Date(now).toISOString()});}
 return out;
}
function createHandlers({onCall,HttpsError,admin,db}){const auth=req=>{if(!req.auth)throw new HttpsError('unauthenticated','Authentication required');return req.auth.uid;};return{rebuildIntelligenceMemory:onCall(async req=>{const uid=auth(req),snap=await db.collection(`users/${uid}/auditEvents`).orderBy('createdAt','desc').limit(500).get(),events=snap.docs.map(d=>d.data()),memories=derive(events),batch=db.batch();for(const memory of memories)batch.set(db.doc(`users/${uid}/intelligenceMemory/${id(memory.memoryKey)}`),{...memory,userId:uid,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});await batch.commit();await db.collection(`users/${uid}/auditEvents`).add({userId:uid,type:'memory.rebuilt',count:memories.length,createdAt:admin.firestore.FieldValue.serverTimestamp(),engineVersion:'5.5.0'});return{count:memories.length};})};}
module.exports={MIN_OBSERVATIONS,derive,createHandlers};
