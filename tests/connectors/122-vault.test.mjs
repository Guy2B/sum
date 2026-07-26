import test from 'node:test';import assert from 'node:assert/strict';
import { storeCredentialReference,credentialStatus } from '../../modules/connectors/credential-vault.mjs';
test('Sprint 122 stores references instead of raw secrets',()=>{const r=storeCredentialReference({connectorId:'x',secretRef:'vault:sigma/mail'});assert.equal(credentialStatus(r),'valid');assert.notEqual(r.displayRef,r.secretRef);});
