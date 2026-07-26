export function createApprovalGate(){const requests=new Map();return{
  request({id,taskId,summary,risk=.5}){const r={id,taskId,summary,risk,status:'pending'};requests.set(id,r);return structuredClone(r);},
  resolve(id,status,actor='user'){if(!['approved','rejected'].includes(status))throw new Error('invalid approval status');const r=requests.get(id);if(!r)throw new Error('unknown approval');const next={...r,status,actor,resolvedAt:new Date().toISOString()};requests.set(id,next);return structuredClone(next);},
  get(id){const r=requests.get(id);return r?structuredClone(r):null;}
}}
