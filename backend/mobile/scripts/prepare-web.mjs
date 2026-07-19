import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const mobileRoot = path.resolve(import.meta.dirname, '..');
const root = path.resolve(mobileRoot, '..');
const web = path.join(mobileRoot, 'www');
await rm(web, { recursive: true, force: true });
await mkdir(web, { recursive: true });
const files = [
  'index.html', 'app.html', 'site.css', 'style.css', 'site.js', 'app.js',
  'chart-fallback.js', 'config.js', 'i18n.js', 'editions.js',
  'manifest.webmanifest', 'service-worker.js', 'lang-en.js', 'lang-fr.js',
  'lang-de.js', 'lang-es.js'
];
for (const file of files) await cp(path.join(root, file), path.join(web, file));
for (const dir of ['assets', 'modules', 'legal']) await cp(path.join(root, dir), path.join(web, dir), { recursive: true });
await writeFile(path.join(web, '.nojekyll'), '', 'utf8');
console.log(`Prepared mobile web assets in ${web}`);
