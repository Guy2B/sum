export function createGmailAdapter({
  fetchMessages,
  exchangeAuthorizationCode,
  refreshAccessToken
}={}){
  if(typeof fetchMessages!=='function') throw new Error('fetchMessages is required');

  return {
    async authorize(code,context={}){
      if(typeof exchangeAuthorizationCode!=='function'){
        throw new Error('authorization exchange is not configured');
      }
      return exchangeAuthorizationCode(code,structuredClone(context));
    },
    async refresh(refreshToken,context={}){
      if(typeof refreshAccessToken!=='function'){
        throw new Error('token refresh is not configured');
      }
      return refreshAccessToken(refreshToken,structuredClone(context));
    },
    async fetch({accessToken,cursor=null,limit=50}={}){
      if(!accessToken) throw new Error('accessToken is required');
      return fetchMessages({accessToken,cursor,limit});
    }
  };
}
