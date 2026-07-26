import test from 'node:test';import assert from 'node:assert/strict';
import { generateDecisionOptions } from '../../modules/decision/option-generator.mjs';
test('Sprint 111 generates actionable alternatives',()=>{const o=generateDecisionOptions({action:{title:'Traiter facture'}});assert.ok(o.length>=4);assert.ok(o.some(x=>x.id==='delegate'));});
