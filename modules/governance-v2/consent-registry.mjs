export function createConsentRegistry(){
  const consents=new Map();
  return {
    grant({subjectId,purpose,scope=[],expiresAt=null}={}){
      if(!subjectId||!purpose) throw new Error('subjectId and purpose are required');
      const key=`${subjectId}:${purpose}`;
      const consent={
        subjectId,
        purpose,
        scope:[...new Set(scope)],
        grantedAt:new Date().toISOString(),
        expiresAt,
        status:'granted'
      };
      consents.set(key,consent);
      return structuredClone(consent);
    },
    revoke(subjectId,purpose){
      const key=`${subjectId}:${purpose}`;
      const item=consents.get(key);
      if(!item) return false;
      item.status='revoked';
      item.revokedAt=new Date().toISOString();
      consents.set(key,item);
      return true;
    },
    check(subjectId,purpose,{now=Date.now(),requiredScope=[]}={}){
      const item=consents.get(`${subjectId}:${purpose}`);
      if(!item||item.status!=='granted') return {granted:false,reason:'missing-or-revoked'};
      if(item.expiresAt&&new Date(item.expiresAt).getTime()<=now) return {granted:false,reason:'expired'};
      const missingScope=requiredScope.filter(scope=>!item.scope.includes(scope));
      if(missingScope.length) return {granted:false,reason:'scope-missing',missingScope};
      return {granted:true,consent:structuredClone(item)};
    }
  };
}
