import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
const suspicious=/(?:Ã.|Â.|â€|ï¿½|Î£)/;
const intentional=new Set([
  path.normalize('modules/essential-context-v2/utf8-health-check.js'),
  path.normalize('tests/essential-context-v2/553.test.mjs'),
  path.normalize('tests/essential-context-v2/utf8-regression.test.mjs')
]);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
test('UTF-8 global patch payload',()=>{for(const f of walk('.').filter(x=>/\.(?:js|mjs|css|html|md|json|ps1)$/i.test(x)&&!intentional.has(path.normalize(x.replace(/^\.\\|^\.\//,'')))))assert.doesNotMatch(fs.readFileSync(f,'utf8'),suspicious,f);});
