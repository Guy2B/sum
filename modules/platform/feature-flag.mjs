export function evaluateFeatureFlag(flag,{actorId='',edition='personal',percentage=100}={}) {
  if(flag.enabled===false) return false;
  if(flag.editions&&!flag.editions.includes(edition)) return false;
  if(percentage>=100) return true;
  let hash=0;
  for(const ch of String(actorId)) hash=(hash*31+ch.charCodeAt(0))>>>0;
  return (hash%100)<percentage;
}
