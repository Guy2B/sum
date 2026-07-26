export function createDailyBrief({ plan, mentalLoad, date = new Date(), greeting = 'Bonjour' } = {}) {
  const focus = plan?.focus || [];
  const criticalCount = (plan?.scheduled || []).filter(item => item.priorityLevel === 'critical').length;

  return {
    title: `${greeting}, voici votre journée.`,
    date: new Date(date).toISOString().slice(0, 10),
    summary: criticalCount
      ? `${criticalCount} élément(s) critique(s) demandent votre attention.`
      : 'Aucune urgence critique détectée.',
    focus: focus.map((item, index) => ({
      rank: index + 1,
      title: item.title,
      minutes: item.estimatedMinutes,
      reason: item.reason,
      slot: item.slot,
    })),
    capacity: {
      usedMinutes: plan?.usedMinutes || 0,
      remainingMinutes: plan?.remainingMinutes || 0,
      overload: Boolean(plan?.overload),
    },
    mentalLoad,
    safetyNotice: 'Sigma planifie et propose. Vous gardez le contrôle des actions sensibles.',
  };
}
