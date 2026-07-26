import test from 'node:test';import assert from 'node:assert/strict';
import {createDocumentAdapter} from '../../modules/connector-pack/document-adapter.mjs';
test('Sprint 133 maps extracted document text',async()=>{const a=createDocumentAdapter({async listDocuments(){return{documents:[{id:'1',name:'PDF',extractedText:'Texte'}]}}});const r=await a.fetchSignals({});assert.equal(r.signals[0].body,'Texte');});
