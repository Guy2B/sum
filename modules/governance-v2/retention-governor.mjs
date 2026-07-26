export function createRetentionGovernor(){
  const policies=new Map();
  return {
    register({classification,maxAgeMs}={}){
      if(!classification||!Number.isFinite(maxAgeMs)||maxAgeMs<0) throw new Error('classification and maxAgeMs are required');
      policies.set(classification,maxAgeMs);
    },
    evaluate(record,{now=Date.now()}={}){
      const maxAgeMs=policies.get(record.classification);
      if(maxAgeMs===undefined) return {retain:true,reason:'no-policy'};
      const age=now-new Date(record.timestamp).getTime();
      return {
        retain:age<=maxAgeMs,
        reason:age<=maxAgeMs?'within-retention':'expired',
        ageMs:age,
        maxAgeMs
      };
    },
    list(){return Object.fromEntries(policies);}
  };
}
