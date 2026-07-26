import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

test('Release 705-709 patches undefined i18n paths safely',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sigma719-'));
  fs.writeFileSync(path.join(dir,'app.html'),'<html><head></head><body></body></html>');
  fs.writeFileSync(path.join(dir,'i18n.js'),'function getByPath(obj,path){ return path.split(".").reduce((o,k)=>o?.[k],obj); }\n');
  fs.writeFileSync(path.join(dir,'health.js'),'const x=i18n.t(item.labelKey);');
  fs.writeFileSync(path.join(dir,'firebase-cloud.js'),'async function sync(){}');
  fs.mkdirSync(path.join(dir,'product'),{recursive:true});
  fs.mkdirSync(path.join(dir,'modules'),{recursive:true});
  const script=fileURLToPath(new URL('../../tools/apply-runtime-firestore-hotfix-719.mjs',import.meta.url));
  execFileSync(process.execPath,[script,dir],{stdio:'pipe'});
  const i18n=fs.readFileSync(path.join(dir,'i18n.js'),'utf8');
  assert.match(i18n,/SIGMA-I18N-UNDEFINED-KEY-GUARD-719/);
  assert.match(i18n,/typeof path !== "string"/);
  assert.match(fs.readFileSync(path.join(dir,'app.html'),'utf8'),/content="719"/);
});
