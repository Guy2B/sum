import test from 'node:test';
import assert from 'node:assert/strict';
import { runDailyExecutiveAssistant } from '../../modules/daily/daily-assistant.mjs';
import { validateDailyAssistant } from '../../modules/daily/product-acceptance.mjs';

test('Sprint 109 validates complete daily assistant flow', () => {
  const result = runDailyExecutiveAssistant({
    attentionQueue: {
      counts: { critical: 1 },
      groups: {
        critical: [{
          id: '1',
          title: 'Entretien demain',
          priority: { score: 90, confidence: 0.9 },
          proposedAction: { title: 'Préparer entretien' },
          explanation: { summary: 'Échéance proche' },
          source: 'email',
        }],
        high: [],
        today: [],
        week: [],
      },
    },
    calendar: { dayStart: '08:00', dayEnd: '12:00' },
    capacity: {
      availableMinutes: 240,
      energy: 1,
      recoveryReserve: 0,
      interruptionReserve: 0,
    },
  });

  assert.equal(validateDailyAssistant(result).ok, true);
});
