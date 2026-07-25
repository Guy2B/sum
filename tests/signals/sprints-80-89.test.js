import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSignalInbox } from '../../modules/signals/signal-inbox.js';
import { explainPriority } from '../../modules/signals/priority-explanation.js';
import { proposeSignalAction } from '../../modules/signals/action-proposals.js';
import { transitionSignal } from '../../modules/signals/approval-workflow.js';
import { normalizeEmail } from '../../modules/signals/email-adapter.js';
import { normalizeCalendarEvent } from '../../modules/signals/calendar-adapter.js';
import { normalizeDocument } from '../../modules/signals/document-adapter.js';
import { runSignalScenario } from '../../modules/signals/scenario-runner.js';
import { learnPreference, removePreference } from '../../modules/signals/preference-learning.js';

test('Sprint 80 builds a sorted unified inbox', () => {
  const inbox = buildSignalInbox([{id:'a',bucket:'high',priorityScore:4},{id:'b',bucket:'high',priorityScore:9}]);
  assert.deepEqual(inbox.high.map(x=>x.id), ['b','a']);
});
test('Sprint 81 explains priority', () => assert.ok(explainPriority({source:'school',deadline:'2026-07-26',riskScore:90},{activeEdition:'family'}).reasons.length >= 3));
test('Sprint 82 protects sensitive actions', () => assert.equal(proposeSignalAction({action:{type:'pay',title:'Payer'}}).requiresApproval, true));
test('Sprint 83 blocks planning before approval', () => assert.throws(() => transitionSignal({state:'detected',action:{requiresApproval:true}}, 'planned')));
test('Sprint 84 normalizes email provenance', () => assert.equal(normalizeEmail({id:'1',subject:'Facture'}).id, 'email:1'));
test('Sprint 85 normalizes calendar events', () => assert.equal(normalizeCalendarEvent({id:'2',title:'Entretien'}).source, 'calendar'));
test('Sprint 86 normalizes documents', () => assert.equal(normalizeDocument({id:'3',filename:'avis.pdf'}).source, 'document'));
test('Sprint 87 runs contextual scenarios', () => assert.equal(runSignalScenario({source:'school',bucket:'high'},{activeEdition:'family'}).edition, 'family'));
test('Sprint 88 preferences are reversible', () => { const s=learnPreference({}, {key:'school:priority',value:'critical'}); assert.equal(removePreference(s,'school:priority')['school:priority'], undefined); });
