const LEVEL_WEIGHT = { critical: 1, high: 0.8, today: 0.55, week: 0.3, info: 0.1 };

export function estimateOutcome(option, context = {}) {
  const priorityLevel = context.action?.priorityLevel || context.signal?.priority?.level || 'today';
  const priorityWeight = LEVEL_WEIGHT[priorityLevel] || 0.4;
  const delay = option.delayHours === null ? 168 : option.delayHours;
  const delayPenalty = Math.min(1, delay / 72);
  const deadlineRisk = context.constraints?.deadline ? deadlineProximity(context.constraints.deadline) : 0;
  const ignorePenalty = option.id === 'ignore' ? priorityWeight : 0;
  const delegatePenalty = option.requiresDelegate && !(context.profile?.delegates || []).length ? 0.2 : 0;

  const benefit = Math.max(0, Math.min(1, priorityWeight * (1 - delayPenalty * 0.6)));
  const risk = Math.max(0, Math.min(1, deadlineRisk * delayPenalty + ignorePenalty + delegatePenalty));
  const confidence = context.signal || context.action ? 0.76 : 0.5;

  return {
    optionId: option.id,
    benefit,
    risk,
    delayPenalty,
    cost: Number(option.cost || 0),
    effortMinutes: Number(option.effortMinutes || 0),
    confidence,
  };
}

function deadlineProximity(value) {
  const deadline = new Date(value);
  if (Number.isNaN(deadline.valueOf())) return 0;
  const hours = (deadline - new Date()) / 36e5;
  if (hours <= 0) return 1;
  if (hours <= 24) return 0.9;
  if (hours <= 72) return 0.65;
  if (hours <= 168) return 0.35;
  return 0.1;
}
