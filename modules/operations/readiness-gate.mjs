export function evaluateReadiness({
  health,
  regression,
  backup,
  migrations,
  security = { ok: true },
} = {}) {
  const checks = {
    health: Boolean(health?.healthy),
    regression: Boolean(regression?.allowed),
    backup: Boolean(backup?.ok),
    migrations: Boolean(migrations),
    security: Boolean(security?.ok),
  };
  return {
    ready: Object.values(checks).every(Boolean),
    checks,
    failures: Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name),
  };
}
