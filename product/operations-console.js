import { createOperationsEngine } from '../modules/operations/operations-engine.mjs';
import { validateBackupPlan, createBackupPlan } from '../modules/operations/backup-plan.mjs';

const engine = createOperationsEngine({ config: { environment: 'production' } });
async function render() {
  const result = await engine.assess({
    checks: {
      attention: async () => ({ ok: true }),
      decision: async () => ({ ok: true }),
      connectors: async () => ({ ok: true }),
      learning: async () => ({ ok: true }),
    },
    regression: { allowed: true },
    backup: validateBackupPlan(createBackupPlan({ targets: ['signals', 'preferences'] })),
    migrations: { version: '194' },
    security: { ok: true },
  });
  document.querySelector('#summary').innerHTML = [
    ['État', result.health.status],
    ['Prêt', result.readiness.ready ? 'Oui' : 'Non'],
    ['Contrôles', Object.keys(result.readiness.checks).length],
    ['Évaluations', result.metrics.counters['operations.assessments']],
  ].map(([label,value]) => `<article class="metric"><span>${label}</span><b>${value}</b></article>`).join('');
  document.querySelector('#checks').innerHTML = Object.entries(result.readiness.checks)
    .map(([name,ok]) => `<article class="card ${ok?'ok':'fail'}"><strong>${name}</strong><p>${ok?'PASS':'FAIL'}</p></article>`).join('');
}
document.querySelector('#assess').onclick = render;
render();
