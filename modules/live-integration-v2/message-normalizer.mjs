function normalizeAddress(value){
  if(!value) return null;
  if(typeof value==='string') return {name:null,address:value};
  return {
    name:value.name||null,
    address:value.address||value.email||null
  };
}

export function normalizeMessage(input={}){
  const id=input.id||input.messageId||input.externalId;
  if(!id) throw new Error('message id is required');

  return {
    id,
    threadId:input.threadId||null,
    source:input.source||input.provider||'unknown',
    subject:input.subject||'(sans objet)',
    snippet:input.snippet||input.preview||'',
    body:input.body||input.text||'',
    from:normalizeAddress(input.from||input.sender),
    to:(input.to||input.recipients||[]).map(normalizeAddress),
    receivedAt:input.receivedAt||input.date||new Date().toISOString(),
    unread:Boolean(input.unread??!input.read),
    labels:[...new Set(input.labels||[])],
    attachments:(input.attachments||[]).map(item=>structuredClone(item)),
    raw:structuredClone(input.raw||{})
  };
}
