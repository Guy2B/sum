import test from 'node:test'; import assert from 'node:assert/strict';
import { EditionSignalProfileRegistry } from '../../../modules/signals/editions/edition-signal-profile-registry.js';
import { defaultEditionSignalProfiles } from '../../../modules/signals/default-edition-signal-profiles.js';
test('Sprint 70 registers all edition profiles',()=>{const r=new EditionSignalProfileRegistry(defaultEditionSignalProfiles);assert.equal(r.list().length,8);assert.equal(r.get('creator').id,'creator');});
