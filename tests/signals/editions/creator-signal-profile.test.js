import test from 'node:test'; import assert from 'node:assert/strict'; import { creatorSignalProfile as p } from '../../../modules/signals/editions/creator-signal-profile.js';
test('Sprint 71 creator prioritizes rights and revenue',()=>{assert.ok(p.priorityBoosts.rights>p.priorityBoosts.publishing);assert.ok(p.keywords.includes('partenariat'));});
