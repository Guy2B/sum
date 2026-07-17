import { cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

const check = spawnSync(process.execPath, [path.join(root, 'scripts/release-check.mjs')], {
  cwd: root,
  stdio: 'inherit'
});
if (check.status !== 0) process.exit(check.status ?? 1);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const files = [
  'index.html', 'app.html', 'site.css', 'style.css', 'site.js', 'app.js',
  'chart-fallback.js', 'config.js', 'i18n.js', 'editions.js',
  'manifest.webmanifest', 'service-worker.js',
  'lang-en.js', 'lang-fr.js', 'lang-de.js', 'lang-es.js'
];
for (const file of files) await cp(path.join(root, file), path.join(dist, file));
for (const dir of ['assets', 'modules', 'legal']) {
  await cp(path.join(root, dir), path.join(dist, dir), { recursive: true });
}
await writeFile(path.join(dist, '.nojekyll'), '', 'utf8');

// A commercial build never exposes the admin QA navigation or panel, even if
// stale markup survived a manual edit. Runtime configuration also keeps it off.
const appPath = path.join(dist, 'app.html');
let app = await readFile(appPath, 'utf8');
app = app
  .replace(/<button[^>]*data-panel="admin"[\s\S]*?<\/button>/g, '')
  .replace(/<section[^>]*id="panel-admin"[\s\S]*?<\/section>/g, '');
await writeFile(appPath, app, 'utf8');

console.log(`Commercial static build created at ${dist}`);
