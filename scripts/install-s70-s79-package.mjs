import fs from 'node:fs';
const path = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
pkg.version = '79.0.0';
pkg.scripts ??= {};
const checks = [
'modules/signals/editions/edition-signal-profile-registry.js','modules/signals/editions/creator-signal-profile.js','modules/signals/editions/frontier-worker-signal-profile.js','modules/signals/editions/professional-signal-profiles.js','modules/signals/editions/life-signal-profiles.js','modules/signals/editions/opportunity-signal-profiles.js','modules/signals/default-edition-signal-profiles.js','modules/signals/edition-aware-signal-router.js','modules/signals/edition-priority-policy.js','modules/signals/edition-action-resolver.js','modules/dashboard/edition-signal-inbox-projection.js','modules/attention/edition-attention-queue.js','modules/signals/edition-signal-feedback.js','modules/release/edition-signal-acceptance-gate.js'
].map(file=>`node --check ${file}`).join(' && ');
if (!String(pkg.scripts.check ?? '').includes('edition-signal-profile-registry.js')) pkg.scripts.check = `${pkg.scripts.check ?? ''} && ${checks}`.replace(/^\s*&&\s*/, '');
pkg.scripts['test:edition-signals'] = 'node --test tests/signals/editions/*.test.js tests/signals/edition-routing-policy.test.js tests/signals/edition-signal-feedback.test.js tests/dashboard/edition-signal-inbox-projection.test.js tests/attention/edition-attention-queue.test.js tests/release/edition-signal-acceptance-gate.test.js';
if (!String(pkg.scripts.test ?? '').includes('test:edition-signals')) pkg.scripts.test = `${pkg.scripts.test ?? ''} && npm run test:edition-signals`.replace(/^\s*&&\s*/, '');
fs.writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
