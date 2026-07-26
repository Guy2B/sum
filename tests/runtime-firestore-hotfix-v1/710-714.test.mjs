import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

test('Release 710-714 injects owner-only Firestore rules',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sigma719-rules-'));
  fs.writeFileSync(path.join(dir,'firebase.json'),JSON.stringify({firestore:{rules:'firestore.rules'}}));
  fs.writeFileSync(path.join(dir,'firestore.rules'),"rules_version = '2';\nservice cloud.firestore {\n match /databases/{database}/documents {\n }\n}\n");
  const script=fileURLToPath(new URL('../../tools/patch-firestore-rules-719.mjs',import.meta.url));
  execFileSync(process.execPath,[script,dir],{stdio:'pipe'});
  const rules=fs.readFileSync(path.join(dir,'firestore.rules'),'utf8');
  assert.match(rules,/SIGMA-USER-OWNERSHIP-RULES-719/);
  assert.match(rules,/request\.auth\.uid == uid/);
  assert.equal(fs.existsSync(path.join(dir,'firestore.rules.before-release-719')),true);
});
