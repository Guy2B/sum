export function createWebhookSubscription({id,url,events=[],secretRef,active=true}={}) {
  if(!id||!url||!secretRef) throw new Error('webhook id, url and secretRef are required');
  return {id,url,events:[...new Set(events)],secretRef,active};
}
