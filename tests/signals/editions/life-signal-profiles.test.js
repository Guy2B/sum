import test from 'node:test'; import assert from 'node:assert/strict'; import { familySignalProfile,caregiverSignalProfile } from '../../../modules/signals/editions/life-signal-profiles.js';
test('Sprint 74 life profiles cover school and medication',()=>{assert.ok(familySignalProfile.domains.includes('school'));assert.ok(caregiverSignalProfile.domains.includes('medication'));});
