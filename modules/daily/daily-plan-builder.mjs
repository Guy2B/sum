import { calculateCapacity } from './capacity-model.mjs';
import { matchActionsToEnergy } from './energy-matcher.mjs';

const LEVEL_ORDER = { critical: 0, high: 1, today: 2, week: 3, info: 4 };

export function buildDailyPlan({
  actions = [],
  capacity: capacityInput = {},
  windows = [],
  energyProfile = [],
  maxFocusItems = 3,
} = {}) {
  const capacity = calculateCapacity(capacityInput);
  const ranked = matchActionsToEnergy(actions, energyProfile).sort((a, b) =>
    (LEVEL_ORDER[a.priorityLevel] ?? 9) - (LEVEL_ORDER[b.priorityLevel] ?? 9) ||
    (b.priorityScore || 0) - (a.priorityScore || 0)
  );

  const scheduled = [];
  const deferred = [];
  let usedMinutes = 0;
  let windowIndex = 0;
  let windowRemaining = windows[0]?.minutes ?? capacity.usableMinutes;

  for (const action of ranked) {
    const duration = action.estimatedMinutes || 30;
    if (usedMinutes + duration > capacity.usableMinutes) {
      deferred.push({ ...action, deferReason: 'Capacité quotidienne insuffisante.' });
      continue;
    }

    while (windows.length && duration > windowRemaining && windowIndex < windows.length - 1) {
      windowIndex += 1;
      windowRemaining = windows[windowIndex].minutes;
    }

    if (windows.length && duration > windowRemaining) {
      deferred.push({ ...action, deferReason: 'Aucun créneau libre assez long.' });
      continue;
    }

    const slot = windows[windowIndex] || null;
    scheduled.push({
      ...action,
      slot: slot ? { start: slot.start, end: slot.end } : null,
      sequence: scheduled.length + 1,
    });
    usedMinutes += duration;
    windowRemaining -= duration;
  }

  return {
    generatedAt: new Date().toISOString(),
    capacity,
    usedMinutes,
    remainingMinutes: Math.max(0, capacity.usableMinutes - usedMinutes),
    focus: scheduled.slice(0, maxFocusItems),
    scheduled,
    deferred,
    overload: ranked.reduce((sum, action) => sum + (action.estimatedMinutes || 30), 0) > capacity.overloadThreshold,
  };
}
