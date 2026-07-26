import test from 'node:test';import assert from 'node:assert/strict';
import {createConsentLedger} from '../../modules/trust/consent-ledger.mjs';
test('Sprint 140 grants and revokes consent',()=>{const l=createConsentLedger();const c=l.grant({subject:'mail',capability:'read-signals'});assert.equal(l.active().length,1);l.revoke(c.id);assert.equal(l.active().length,0);});
