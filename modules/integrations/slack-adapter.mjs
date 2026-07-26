export function createSlackAdapter(client){
  return {
    async listSignals({channel,cursor=null}={}){
      return client.listMessages({channel,cursor});
    },
    normalize(message){
      return {
        externalId:message.ts,
        type:'chat-message',
        title:message.text?.slice(0,80)||'(message)',
        sender:message.user||null,
        channel:message.channel||null,
        raw:structuredClone(message)
      };
    }
  };
}
