import test from 'node:test';import assert from 'node:assert/strict';
import {exportUserData,serializeExport} from '../../modules/trust/export-engine.mjs';
test('Sprint 146 exports portable user data',()=>{const p=exportUserData({profile:{name:'X'}});assert.match(serializeExport(p),/sigma-user-export-v1/);});
