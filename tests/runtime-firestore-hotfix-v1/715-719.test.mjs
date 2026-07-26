import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('Release 715-719 exposes runtime diagnostics and acceptance',()=>{
  const listeners={};
  const document={querySelector(){return{content:'719'}}};
  const window={document,addEventListener(n,f){listeners[n]=f},dispatchEvent(){}};window.window=window;
  const context=vm.createContext({window,document,console,Date,CustomEvent:function(){}});
  for(const f of ['runtime-firestore-hotfix-v1.js','runtime-firestore-hotfix-acceptance-v1.js']){
    vm.runInContext(fs.readFileSync(new URL('../../modules/runtime-firestore-hotfix-v1/'+f,import.meta.url),'utf8'),context);
  }
  assert.equal(context.window.SigmaRuntimeFirestoreHotfixAcceptanceV1.validate().ok,true);
  assert.equal(context.window.SigmaRuntimeFirestoreHotfixV1.diagnostics().release,719);
});
