export function createPreferenceProfile({subjectId,defaults={}}={}){
  if(!subjectId) throw new Error('subjectId is required');
  const values=new Map(Object.entries(defaults));
  return {
    subjectId,
    set(key,value){values.set(key,structuredClone(value));},
    get(key,fallback=null){return values.has(key)?structuredClone(values.get(key)):fallback;},
    snapshot(){return Object.fromEntries([...values.entries()].map(([k,v])=>[k,structuredClone(v)]));}
  };
}
