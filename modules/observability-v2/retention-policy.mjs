export function applyRetention(records=[],{
  now=Date.now(),
  maxAgeMs=30*24*60*60*1000,
  maxRecords=10000
}={}){
  return records
    .filter(record=>now-new Date(record.timestamp).getTime()<=maxAgeMs)
    .sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp))
    .slice(-maxRecords)
    .map(record=>structuredClone(record));
}
