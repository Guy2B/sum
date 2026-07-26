export function createAssociationGraph(){const n=new Map(),e=new Map();return{
 addNode(m){n.set(m.id,structuredClone(m))},
 connect(from,to,relation='related',weight=.5){if(!n.has(from)||!n.has(to))throw new Error('unknown memory node');const k=`${from}->${to}:${relation}`;e.set(k,{from,to,relation,weight:Math.max(0,Math.min(1,weight))});return structuredClone(e.get(k))},
 neighbors(id){return[...e.values()].filter(x=>x.from===id||x.to===id).map(x=>structuredClone(x))},
 snapshot(){return{nodes:[...n.values()].map(x=>structuredClone(x)),edges:[...e.values()].map(x=>structuredClone(x))}}
}}
