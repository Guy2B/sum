export function normalizeExternalItem(item,{provider,kind}={}) {
  return {
    externalId:String(item.id),
    provider,
    kind,
    title:item.title||item.subject||item.name||'Untitled',
    body:item.body||item.description||item.text||'',
    occurredAt:item.occurredAt||item.updatedAt||item.createdAt||null,
    participants:[...(item.participants||item.attendees||[])],
    raw:structuredClone(item)
  };
}
