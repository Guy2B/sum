function tokenize(v){return String(v).normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(x=>x.length>1)}
export function createMemoryIndex(){const inv=new Map(),docs=new Map();return{
 add(r){const t=[...new Set(tokenize([r.content,...(r.tags||[]),r.type,r.owner].join(' ')))];docs.set(r.id,structuredClone(r));for(const x of t){const ids=inv.get(x)||new Set();ids.add(r.id);inv.set(x,ids)}return t},
 search(q){const scores=new Map();for(const t of tokenize(q))for(const id of inv.get(t)||[])scores.set(id,(scores.get(id)||0)+1);return [...scores.entries()].sort((a,b)=>b[1]-a[1]).map(([id,score])=>({...structuredClone(docs.get(id)),score}))}
}}
