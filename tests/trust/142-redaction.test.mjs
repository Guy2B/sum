import test from 'node:test';import assert from 'node:assert/strict';
import {redactSensitiveText} from '../../modules/trust/redaction-engine.mjs';
test('Sprint 142 masks personal identifiers',()=>{const r=redactSensitiveText('Contact test@example.com');assert.doesNotMatch(r.text,/@/);assert.equal(r.findings[0].type,'email');});
