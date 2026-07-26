export function createMemoryStore(){const records=new Map();return{
 put(r){records.set(r.id,structuredClone(r));return structuredClone(r)},
 get(id){const x=records.get(id);return x?structuredClone(x):null},
 delete(id){return records.delete(id)},
 list({type,owner,tag}={}){return [...records.values()].filter(x=>!type||x.type===type).filter(x=>!owner||x.owner===owner).filter(x=>!tag||x.tags.includes(tag)).map(x=>structuredClone(x))},
 count(){return records.size},clear(){records.clear()}
}}
