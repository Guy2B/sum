import test from 'node:test';import assert from 'node:assert/strict';
import {createFinanceAdapter} from '../../modules/connector-pack/finance-adapter.mjs';
test('Sprint 134 maps banking movements',async()=>{const a=createFinanceAdapter({async listTransactions(){return{transactions:[{id:'1',merchant:'Banque',amount:-10}]}}});const r=await a.fetchSignals({});assert.equal(r.signals[0].metadata.amount,-10);});
