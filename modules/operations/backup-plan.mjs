export function createBackupPlan({
  targets = [],
  retentionDays = 30,
  encrypted = true,
} = {}) {
  return {
    targets: [...new Set(targets)],
    retentionDays,
    encrypted,
    schedule: 'daily',
    verification: 'checksum',
    createdAt: new Date().toISOString(),
  };
}

export function validateBackupPlan(plan) {
  const failures = [];
  if (!plan.targets?.length) failures.push('no backup targets');
  if (plan.retentionDays < 1) failures.push('invalid retention');
  if (!plan.encrypted) failures.push('backup must be encrypted');
  return { ok: failures.length === 0, failures };
}
