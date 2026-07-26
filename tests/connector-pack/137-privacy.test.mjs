import test from 'node:test';import assert from 'node:assert/strict';
import {filterConnectorPayload} from '../../modules/connector-pack/privacy-filter.mjs';
test('Sprint 137 removes secrets from payloads',()=>{const r=filterConnectorPayload({accessToken:'secret',body:'ok'});assert.equal('accessToken' in r,false);});
