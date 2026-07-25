export function exportBackup(state) { return JSON.stringify({ schema:'sigma-product-backup', version:1, exportedAt:new Date().toISOString(), state }, null, 2); }
export function importBackup(raw) {
  const parsed=JSON.parse(raw);
  if (parsed.schema!=='sigma-product-backup' || parsed.version!==1) throw new Error('Unsupported Sigma backup');
  if (!parsed.state || !Array.isArray(parsed.state.goals) || !Array.isArray(parsed.state.tasks)) throw new Error('Invalid Sigma backup');
  return parsed.state;
}
