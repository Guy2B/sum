export function createConnectorAudit(){const entries=[];return{
  record(entry){const item={sequence:entries.length+1,timestamp:new Date().toISOString(),...structuredClone(entry)};entries.push(item);return structuredClone(item);},
  list({provider,accountId}={}){return entries.filter(e=>!provider||e.provider===provider).filter(e=>!accountId||e.accountId===accountId).map(e=>structuredClone(e));}
}}
