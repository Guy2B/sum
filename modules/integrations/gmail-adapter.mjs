export function createGmailAdapter(client){
  return {
    async listSignals({query='',cursor=null}={}){
      return client.listMessages({query,cursor});
    },
    normalize(message){
      return {
        externalId:message.id,
        type:'email',
        title:message.subject||'(sans objet)',
        sender:message.from||null,
        receivedAt:message.date||null,
        raw:structuredClone(message)
      };
    }
  };
}
