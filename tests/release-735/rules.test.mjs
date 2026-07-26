import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

test('places ownership rules in the documents block',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sigma735-rules-'));
  fs.writeFileSync(path.join(dir,'firebase.json'),JSON.stringify({firestore:{rules:'firestore.rules'}}));
  fs.writeFileSync(path.join(dir,'firestore.rules'),"rules_version='2';\nservice cloud.firestore {\n match /databases/{database}/documents {\n }\n}\n");
  const script=fileURLToPath(new URL('../../tools/repair-firestore-rules-735.mjs',import.meta.url));
  execFileSync(process.execPath,[script,dir]);
  const out=fs.readFileSync(path.join(dir,'firestore.rules'),'utf8');
  const docsStart=out.indexOf('match /databases/{database}/documents');
  const users=out.indexOf('match /users/{uid}');
  const serviceClose=out.lastIndexOf('}');
  assert.ok(docsStart>=0&&users>docsStart&&users<serviceClose);
  assert.match(out,/SIGMA-USER-OWNERSHIP-RULES-735/);
});
