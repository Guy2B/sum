import { extractActionsFromAttentionQueue } from './action-extractor.mjs';
import { buildTimeWindows } from './time-window-engine.mjs';
import { buildDailyPlan } from './daily-plan-builder.mjs';
import { assessMentalLoad } from './mental-load-engine.mjs';
import { classifyExecutionOptions } from './delegation-engine.mjs';
import { createDailyBrief } from './daily-brief.mjs';

export function runDailyExecutiveAssistant({
  attentionQueue,
  calendar = {},
  capacity = {},
  energyProfile = [],
  context = {},
  date = new Date(),
} = {}) {
  const extracted = extractActionsFromAttentionQueue(attentionQueue);
  const actions = classifyExecutionOptions(extracted, context);
  const windows = buildTimeWindows(calendar);
  const plan = buildDailyPlan({ actions, windows, capacity, energyProfile });
  const mentalLoad = assessMentalLoad({
    actions,
    unresolvedSignals: Object.values(attentionQueue?.counts || {}).reduce((a, b) => a + b, 0),
    contextSwitches: new Set(actions.map(action => action.domain || action.source)).size,
  });
  const brief = createDailyBrief({ plan, mentalLoad, date });

  return { actions, windows, plan, mentalLoad, brief };
}
