export const STORAGE_KEY = 'sigma-product-v2';
export function serializeState(state) { return JSON.stringify({ version:2, savedAt:new Date().toISOString(), data:state }); }
export function deserializeState(raw) {
  if (!raw) return { goals:[], tasks:[], reviews:[], plan:[] };
  const parsed = JSON.parse(raw);
  return parsed.version === 2 ? parsed.data : parsed;
}
export function mergeState(local, incoming) {
  const merge=(a=[],b=[])=>[...new Map([...a,...b].map(item=>[item.id,item])).values()];
  return { ...local, ...incoming, goals:merge(local.goals,incoming.goals), tasks:merge(local.tasks,incoming.tasks), reviews:merge(local.reviews,incoming.reviews) };
}
