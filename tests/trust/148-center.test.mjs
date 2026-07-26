import test from 'node:test';import assert from 'node:assert/strict';
import {createTrustCenter} from '../../modules/trust/trust-center.mjs';
test('Sprint 148 unifies trust controls',()=>{const c=createTrustCenter({connectors:[{enabled:true}]});c.ledger.grant({subject:'mail',capability:'read-signals'});assert.equal(c.report().permissions.active,1);});
