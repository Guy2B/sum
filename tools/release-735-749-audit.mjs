import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(process.argv[2] || process.cwd());
const required = [
  'app.html', 'config.js', 'online-config.js', 'modules/social.js',
  'backend/social-connector/server.js',
  'backend/social-connector/lib/state.js',
  'backend/social-connector/lib/store.js',
  'backend/social-connector/lib/providers/linkedin.js',
  'backend/social-connector/lib/providers/x.js',
  'backend/social-connector/lib/providers/tiktok.js',
  'backend/social-connector/lib/providers/youtube.js',
  'backend/social-connector/lib/providers/meta.js'
];

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const files = required.map((relative) => {
  const absolute = path.join(root, relative);
  return { relative, exists: fs.existsSync(absolute), sha256: fs.existsSync(absolute) ? sha256(absolute) : null };
});

let socialApiBaseUrlDeclared = false;
const config = path.join(root, 'config.js');
if (fs.existsSync(config)) socialApiBaseUrlDeclared = /socialApiBaseUrl/.test(fs.readFileSync(config, 'utf8'));

let recoveryLoaderPresent = false;
const app = path.join(root, 'app.html');
if (fs.existsSync(app)) recoveryLoaderPresent = /social-connector-recovery-v749\.js/.test(fs.readFileSync(app, 'utf8'));

const report = {
  release: 749,
  root,
  preservationMode: true,
  missing: files.filter((item) => !item.exists).map((item) => item.relative),
  files,
  socialApiBaseUrlDeclared,
  recoveryLoaderPresent
};
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.missing.length ? 2 : 0;
