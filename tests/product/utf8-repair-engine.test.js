import test from 'node:test';import assert from 'node:assert/strict';import{repairUtf8Text,findMojibake}from'../../modules/product/utf8-repair-engine.js';
test('repairs common mojibake',()=>{const value=repairUtf8Text('Aujourdâ€™hui â€” GÃ©rer Î£');assert.equal(value,'Aujourd’hui — Gérer Σ');assert.deepEqual(findMojibake(value),[]);});
