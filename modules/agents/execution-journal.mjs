export function createExecutionJournal(){const entries=[];return{
  append(entry){const item={sequence:entries.length+1,timestamp:new Date().toISOString(),...structuredClone(entry)};entries.push(item);return structuredClone(item);},
  list(filter={}){return entries.filter(e=>!filter.taskId||e.taskId===filter.taskId).map(e=>structuredClone(e));}
}}
