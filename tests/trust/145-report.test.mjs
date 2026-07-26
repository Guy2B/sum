import test from 'node:test';import assert from 'node:assert/strict';
import {buildPrivacyReport} from '../../modules/trust/privacy-report.mjs';
test('Sprint 145 builds a privacy report',()=>{const r=buildPrivacyReport({connectors:[{enabled:true}],consents:[{status:'granted',capability:'read-signals'}]});assert.equal(r.connectors.enabled,1);assert.equal(r.permissions.active,1);});
