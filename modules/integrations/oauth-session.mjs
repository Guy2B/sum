export function createOAuthSession({provider,state,scopes=[],expiresAt=null}={}){
  if(!provider||!state) throw new Error('provider and state are required');
  return {
    provider,
    state,
    scopes:[...new Set(scopes)],
    expiresAt,
    status:'pending'
  };
}
export function completeOAuthSession(session,{accessTokenRef,refreshTokenRef=null}={}){
  if(!accessTokenRef) throw new Error('accessTokenRef is required');
  return {...structuredClone(session),accessTokenRef,refreshTokenRef,status:'connected'};
}
