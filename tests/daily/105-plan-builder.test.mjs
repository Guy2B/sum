import test from 'node:test';import assert from 'node:assert/strict';
import { buildDailyPlan } from '../../modules/daily/daily-plan-builder.mjs';
test('Sprint 105 never exceeds usable capacity',()=>{const p=buildDailyPlan({actions:[{id:'1',estimatedMinutes:200,priorityLevel:'critical',priorityScore:90},{id:'2',estimatedMinutes:200,priorityLevel:'high',priorityScore:70}],capacity:{availableMinutes:300,energy:1,recoveryReserve:0,interruptionReserve:0}});assert.ok(p.usedMinutes<=p.capacity.usableMinutes);assert.ok(p.deferred.length>=1);});
