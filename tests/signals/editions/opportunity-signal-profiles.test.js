import test from 'node:test'; import assert from 'node:assert/strict'; import { jobSeekerSignalProfile,studentSignalProfile } from '../../../modules/signals/editions/opportunity-signal-profiles.js';
test('Sprint 75 opportunity profiles cover interviews and exams',()=>{assert.equal(jobSeekerSignalProfile.priorityBoosts.interview,28);assert.ok(studentSignalProfile.domains.includes('exam'));});
