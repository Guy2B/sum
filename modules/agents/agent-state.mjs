export function createAgentState(){const state=new Map();return{
  set(agentId,value){state.set(agentId,structuredClone(value));},
  get(agentId){const v=state.get(agentId);return v?structuredClone(v):null;},
  update(agentId,patch){const next={...(state.get(agentId)||{}),...structuredClone(patch)};state.set(agentId,next);return structuredClone(next);},
  list(){return [...state.entries()].map(([agentId,value])=>({agentId,value:structuredClone(value)}));}
}}
