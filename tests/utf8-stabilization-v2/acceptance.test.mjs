import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {execFileSync} from 'node:child_process';
const root=path.resolve(new URL('../../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sigma-utf8-'));
fs.copyFileSync(path.join(root,'tests','utf8-stabilization-v2','fixture-app.html'),path.join(tmp,'app.html'));
execFileSync(process.execPath,[path.join(root,'tools','repair-target.mjs'),tmp]);
const html=fs.readFileSync(path.join(tmp,'app.html'),'utf8');
const checks=[
 ['555 BOM',()=>assert.notEqual(html.charCodeAt(0),0xFEFF)],
 ['556 separators',()=>assert.match(html,/0 signaux · 0 relations/)],
 ['557 emoji',()=>assert.match(html,/💼/u)],
 ['558 accents',()=>assert.match(html,/Demander à Σ/)],
 ['559 arrows',()=>assert.match(html,/1 → 3/)],
 ['560 outcomes',()=>assert.match(html,/Trois résultats à protéger/)],
 ['561 calendar',()=>{assert.match(html,/‹/);assert.match(html,/›/)}],
 ['562 providers',()=>assert.match(html,/Gmail · Calendar · Drive · YouTube/)],
 ['563 authorization',()=>assert.match(html,/Autorisation Gmail à activer/)],
 ['564 Apple',()=>assert.match(html,//u)],
 ['565 Social',()=>assert.match(html,/Social Command Center · V4\.12/)],
 ['566 Employment',()=>assert.match(html,/Mettre à jour le matching/)],
 ['567 Journey',()=>assert.match(html,/Qu’aimeriez-vous retenir d’aujourd’hui/)],
 ['568 Learning',()=>assert.match(html,/Mes apprentissages/)],
 ['569 Assets',()=>{assert.match(html,/SIGMA-UTF8-EXPERIENCE-POLISH-V2/);assert.ok(fs.existsSync(path.join(tmp,'UTF8-REPAIR-REPORT.json')))}]
];
for(const [name,fn] of checks)test(`Sprint ${name}`,fn);
test('Global UTF-8 acceptance',()=>assert.doesNotMatch(html,/(?:Ã.|Â.|â€|ï¿½|Î£|ðŸ)/u));
