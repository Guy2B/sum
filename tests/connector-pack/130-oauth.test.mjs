import test from 'node:test';import assert from 'node:assert/strict';
import {createOAuthSession,completeOAuthSession} from '../../modules/connector-pack/oauth-session.mjs';
test('Sprint 130 secures OAuth state and credential references',()=>{const s=createOAuthSession({provider:'mail',state:'abc',redirectUri:'http://localhost'});assert.equal(completeOAuthSession(s,{returnedState:'abc',credentialRef:'vault:mail'}).status,'connected');});
