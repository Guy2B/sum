import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

test('repairs i18n syntax safely',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sigma735-i18n-'));
  fs.writeFileSync(path.join(dir,'i18n.js'),'broken )');
  fs.writeFileSync(path.join(dir,'i18n.js.before-release-719'),'function getByPath(obj,path){return path.split(".").reduce((v,k)=>v?.[k],obj)}');
  const script=fileURLToPath(new URL('../../tools/repair-i18n-735.mjs',import.meta.url));
  execFileSync(process.execPath,[script,dir]);
  const out=fs.readFileSync(path.join(dir,'i18n.js'),'utf8');
  assert.match(out,/SIGMA-I18N-SYNTAX-REPAIR-735/);
  assert.match(out,/typeof path === "string"/);
  execFileSync(process.execPath,['--check',path.join(dir,'i18n.js')]);
});
