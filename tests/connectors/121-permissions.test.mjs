import test from 'node:test';import assert from 'node:assert/strict';
import { createPermissionGrant,approvePermission } from '../../modules/connectors/permission-model.mjs';
test('Sprint 121 requires approval for write permissions',()=>{const g=createPermissionGrant({id:'x',capabilities:['read-signals','write-actions']},['read-signals','write-actions']);assert.deepEqual(g.pendingApproval,['write-actions']);assert.ok(approvePermission(g,'write-actions').granted.includes('write-actions'));});
