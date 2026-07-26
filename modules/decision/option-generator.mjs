export function generateDecisionOptions(context = {}) {
  const base = context.action || {};
  const title = base.title || context.signal?.title || 'Décision';
  const options = [
    {
      id: 'do-now',
      label: 'Agir maintenant',
      description: `Traiter maintenant : ${title}`,
      delayHours: 0,
      cost: Number(base.cost || 0),
      effortMinutes: Number(base.estimatedMinutes || 30),
      reversible: base.reversible ?? true,
    },
    {
      id: 'schedule',
      label: 'Planifier',
      description: `Planifier : ${title}`,
      delayHours: 24,
      cost: Number(base.cost || 0),
      effortMinutes: Number(base.estimatedMinutes || 30),
      reversible: true,
    },
    {
      id: 'delegate',
      label: 'Déléguer',
      description: `Confier à une personne autorisée : ${title}`,
      delayHours: 4,
      cost: Number(base.delegationCost || 0),
      effortMinutes: 10,
      reversible: true,
      requiresDelegate: true,
    },
    {
      id: 'ignore',
      label: 'Ignorer',
      description: `Ne pas traiter : ${title}`,
      delayHours: null,
      cost: 0,
      effortMinutes: 0,
      reversible: false,
    },
  ];

  return [...options, ...(context.alternatives || [])];
}
