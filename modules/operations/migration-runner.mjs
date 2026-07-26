export async function runMigrations(migrations = [], store = new Set()) {
  const applied = [];
  const skipped = [];
  for (const migration of migrations) {
    if (store.has(migration.id)) {
      skipped.push(migration.id);
      continue;
    }
    await migration.up();
    store.add(migration.id);
    applied.push(migration.id);
  }
  return { applied, skipped, version: [...store].sort().at(-1) || null };
}
