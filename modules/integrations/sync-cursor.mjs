export function createSyncCursor(){const cursors=new Map();return{
  get(key){return cursors.get(key)??null;},
  set(key,value){cursors.set(key,structuredClone(value));return structuredClone(value);},
  reset(key){return cursors.delete(key);},
  snapshot(){return Object.fromEntries([...cursors.entries()].map(([k,v])=>[k,structuredClone(v)]));}
}}
