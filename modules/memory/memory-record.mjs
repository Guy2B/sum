export function createMemoryRecord({id,type='episodic',content,source='unknown',owner='self',importance=.5,confidence=.5,tags=[],createdAt=new Date().toISOString(),expiresAt=null,metadata={}}={}) {
  if(!id) throw new Error('memory id is required');
  if(content===undefined||content===null) throw new Error('memory content is required');
  if(!['episodic','semantic','procedural','preference','relationship'].includes(type)) throw new Error('unsupported memory type');
  return Object.freeze({id,type,content,source,owner,importance:Math.max(0,Math.min(1,Number(importance))),confidence:Math.max(0,Math.min(1,Number(confidence))),tags:[...new Set(tags.map(String))],createdAt,expiresAt,metadata:structuredClone(metadata)});
}
