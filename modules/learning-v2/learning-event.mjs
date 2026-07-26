export function createLearningEvent({
  id,
  type,
  source,
  subjectId=null,
  timestamp=new Date().toISOString(),
  payload={}
}={}){
  if(!id||!type||!source) throw new Error('learning event id, type and source are required');
  return {
    id,
    type,
    source,
    subjectId,
    timestamp,
    payload:structuredClone(payload)
  };
}
