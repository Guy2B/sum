import test from 'node:test';import assert from 'node:assert/strict';
import { extractActionsFromAttentionQueue } from '../../modules/daily/action-extractor.mjs';
test('Sprint 100 converts attention signals to actions',()=>{const a=extractActionsFromAttentionQueue({groups:{critical:[{id:'1',title:'Facture',priority:{score:90},proposedAction:{title:'Régler la facture'}}],high:[],today:[],week:[]}});assert.equal(a.length,1);assert.equal(a[0].signalId,'1');});
