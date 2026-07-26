const ENERGY_RANK = { low: 1, medium: 2, high: 3 };

export function matchActionsToEnergy(actions = [], energyProfile = []) {
  const profile = energyProfile.length ? energyProfile : [
    { period: 'morning', energy: 'high' },
    { period: 'afternoon', energy: 'medium' },
    { period: 'evening', energy: 'low' },
  ];

  return [...actions].sort((a, b) => {
    const aRank = ENERGY_RANK[a.energy] || 2;
    const bRank = ENERGY_RANK[b.energy] || 2;
    return (b.priorityScore || 0) - (a.priorityScore || 0) || bRank - aRank;
  }).map(action => ({
    ...action,
    preferredPeriod: profile.find(item => (ENERGY_RANK[item.energy] || 2) >= (ENERGY_RANK[action.energy] || 2))?.period
      || profile.at(-1)?.period
      || 'any',
  }));
}
