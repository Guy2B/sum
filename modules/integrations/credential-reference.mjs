export function createCredentialReference({providerId,accountId,secretId,scopes=[],expiresAt=null}={}) {
  if(!providerId||!accountId||!secretId) throw new Error('providerId, accountId and secretId are required');
  return {providerId,accountId,secretId,scopes:[...new Set(scopes)],expiresAt};
}
