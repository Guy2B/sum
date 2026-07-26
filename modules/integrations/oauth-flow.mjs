export function createOAuthAuthorizationUrl({authorizeUrl,clientId,redirectUri,scopes=[],state,extra={}}={}) {
  const url=new URL(authorizeUrl);
  url.searchParams.set('client_id',clientId);
  url.searchParams.set('redirect_uri',redirectUri);
  url.searchParams.set('response_type','code');
  url.searchParams.set('scope',scopes.join(' '));
  if(state) url.searchParams.set('state',state);
  for(const [k,v] of Object.entries(extra)) url.searchParams.set(k,String(v));
  return url.toString();
}
