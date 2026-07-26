import test from 'node:test';import assert from 'node:assert/strict';
import { matchActionsToEnergy } from '../../modules/daily/energy-matcher.mjs';
test('Sprint 104 matches demanding work to energy',()=>{const [a]=matchActionsToEnergy([{id:'1',energy:'high',priorityScore:80}],[{period:'morning',energy:'high'}]);assert.equal(a.preferredPeriod,'morning');});
