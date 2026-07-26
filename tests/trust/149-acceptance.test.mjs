import test from 'node:test';import assert from 'node:assert/strict';
import {createTrustCenter} from '../../modules/trust/trust-center.mjs';
import {validateTrustCenter} from '../../modules/trust/product-acceptance.mjs';
test('Sprint 149 validates trust and control flow',()=>{const c=createTrustCenter();const result=validateTrustCenter({report:c.report(),exportPayload:c.export(),deletionPlan:c.deletionPlan({userId:'u'})});assert.equal(result.ok,true);});
