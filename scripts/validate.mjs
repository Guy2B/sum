import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['node_modules', '.git']);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

function flatten(value, prefix = '') {
  const result = [];
  for (const [key, item] of Object.entries(value || {})) {
    const target = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === 'object' && !Array.isArray(item)) result.push(...flatten(item, target));
    else result.push(target);
  }
  return result.sort();
}

const files = await walk(root);
const javascript = files.filter((file) => file.endsWith('.js') || file.endsWith('.mjs'));
for (const file of javascript) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(1);
  }
}

const htmlFiles = ['app.html', 'index.html'];
const allIds = new Set();
const htmlByName = {};
for (const htmlFile of htmlFiles) {
  const html = await readFile(path.join(root, htmlFile), 'utf8');
  htmlByName[htmlFile] = html;
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) {
    console.error(`Duplicate HTML IDs in ${htmlFile}:`, duplicateIds.join(', '));
    process.exit(1);
  }
  ids.forEach((id) => allIds.add(id));
}

const source = await Promise.all(javascript.map((file) => readFile(file, 'utf8')));
const joinedSource = source.join('\n');
const referencedIds = [...joinedSource.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map((match) => match[1]);
const missingIds = [...new Set(referencedIds.filter((id) => !allIds.has(id)))];
if (missingIds.length) {
  console.error('Missing HTML IDs:', missingIds.join(', '));
  process.exit(1);
}

for (const asset of ['index.html', 'app.html', 'style.css', 'site.css', 'app.js', 'service-worker.js', 'manifest.webmanifest']) {
  if (!files.includes(path.join(root, asset))) {
    console.error(`Missing required file: ${asset}`);
    process.exit(1);
  }
}

// Translation parity across the four supported launch languages.
const languageKeys = {};
for (const language of ['en', 'fr', 'de', 'es']) {
  const code = await readFile(path.join(root, `lang-${language}.js`), 'utf8');
  const context = { window: { SUM_LANG: {} } };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: `lang-${language}.js` });
  languageKeys[language] = flatten(context.window.SUM_LANG[language]);
}
const reference = new Set(languageKeys.en);
for (const language of ['fr', 'de', 'es']) {
  const current = new Set(languageKeys[language]);
  const missing = [...reference].filter((key) => !current.has(key));
  const extra = [...current].filter((key) => !reference.has(key));
  if (missing.length || extra.length) {
    console.error(`Translation parity failed for ${language}. Missing: ${missing.slice(0, 8).join(', ')}; extra: ${extra.slice(0, 8).join(', ')}`);
    process.exit(1);
  }
}

// Release-specific regression checks.
const appHtml = htmlByName['app.html'];
const healthCode = await readFile(path.join(root, 'modules/health.js'), 'utf8');
const worker = await readFile(path.join(root, 'service-worker.js'), 'utf8');
for (const provider of ['apple', 'health-connect', 'samsung', 'huawei']) {
  if (!appHtml.includes(`data-health-provider="${provider}"`)) {
    console.error(`Missing interactive health provider: ${provider}`);
    process.exit(1);
  }
}
if (!healthCode.includes("querySelectorAll('[data-health-provider]')")) {
  console.error('Health provider buttons are not directly wired to click listeners.');
  process.exit(1);
}
if (!appHtml.includes('modules/local-ai.js') || !worker.includes('modules/local-ai.js')) {
  console.error('Local AI fallback layer is not included in both app and offline shell.');
  process.exit(1);
}
const clientFacingText = [appHtml, htmlByName['index.html'], ...await Promise.all(['app.js','site.js','lang-en.js','lang-fr.js','lang-de.js','lang-es.js'].map((file) => readFile(path.join(root, file), 'utf8')))].join('\n');
if (clientFacingText.includes('Google Sheets')) {
  console.error('Internal backup implementation leaked into the customer-facing app.');
  process.exit(1);
}
if (!appHtml.includes('id="coach-signal-strip"')) {
  console.error('Coach cross-workspace signal strip is missing.');
  process.exit(1);
}

console.log(`Validation passed: ${javascript.length} JavaScript files, ${allIds.size} unique HTML IDs, ${referencedIds.length} DOM references, ${languageKeys.en.length} translated keys × 4 languages.`);
