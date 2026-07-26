export function createDeveloperToken({id,owner,scopes=[],expiresAt=null}={}) {
  if(!id||!owner) throw new Error('token id and owner are required');
  return {id,owner,scopes:[...new Set(scopes)],expiresAt,status:'active'};
}
export function authorizeDeveloperToken(token,scope,{now=Date.now()}={}){
  if(token.status!=='active') return false;
  if(token.expiresAt&&new Date(token.expiresAt).getTime()<=now) return false;
  return token.scopes.includes(scope);
}
