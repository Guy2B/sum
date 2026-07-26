export function messageToSignal(message={}){
  const text=[message.subject,message.snippet,message.body].filter(Boolean).join(' ');
  return {
    id:`signal:${message.source}:${message.id}`,
    source:message.source,
    sourceId:message.id,
    type:'message',
    title:message.subject,
    summary:message.snippet||message.body?.slice(0,240)||'',
    sender:message.from?.address||null,
    receivedAt:message.receivedAt,
    unread:Boolean(message.unread),
    hasAttachment:Boolean(message.attachments?.length),
    text,
    metadata:{
      threadId:message.threadId,
      labels:[...(message.labels||[])]
    }
  };
}
