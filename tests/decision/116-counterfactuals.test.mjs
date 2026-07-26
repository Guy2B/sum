import test from 'node:test';import assert from 'node:assert/strict';
import { buildCounterfactuals } from '../../modules/decision/counterfactual-engine.mjs';
test('Sprint 116 describes consequences of alternatives',()=>{const c=buildCounterfactuals([{option:{id:'do-now'}},{option:{id:'schedule'}}]);assert.equal(c.length,2);assert.match(c[0].statement,/maintenant/);});
