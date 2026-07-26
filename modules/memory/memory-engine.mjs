import {createMemoryStore} from './memory-store.mjs';import {createMemoryIndex} from './memory-index.mjs';import {createMemoryRecord} from './memory-record.mjs';import {canStoreMemory} from './memory-consent.mjs';import {computeSalience} from './salience-engine.mjs';import {rankMemories} from './retrieval-engine.mjs';
export function createMemoryEngine({consent={default:{enabled:true}}}={}){const store=createMemoryStore(),index=createMemoryIndex();return{
 remember(input){const r=createMemoryRecord(input),p=canStoreMemory(r,consent);if(!p.allowed)throw new Error(p.reason);store.put(r);index.add(r);return r},
 recall(q,o={}){return rankMemories(index.search(q).map(m=>({...m,salience:computeSalience(m,o)})))},
 get:id=>store.get(id),forget:id=>store.delete(id),list:f=>store.list(f),stats:()=>({count:store.count()})
}}
