const WEIGHTS = { critical: 5, high: 3, today: 2, week: 1, info: 0.25 };

export function assessMentalLoad({ actions = [], unresolvedSignals = 0, contextSwitches = 0 } = {}) {
  const weighted = actions.reduce((sum, action) => sum + (WEIGHTS[action.priorityLevel] || 1), 0);
  const score = Math.min(100, Math.round(weighted * 4 + unresolvedSignals * 1.5 + contextSwitches * 3));
  const level = score >= 75 ? 'very-high' : score >= 55 ? 'high' : score >= 30 ? 'moderate' : 'low';

  const recommendations = [];
  if (level === 'very-high' || level === 'high') {
    recommendations.push('Limiter la journée à trois résultats essentiels.');
    recommendations.push('Différer ou déléguer les éléments sans échéance proche.');
  }
  if (contextSwitches > 4) recommendations.push('Regrouper les actions par domaine ou source.');
  if (!recommendations.length) recommendations.push('La charge est compatible avec une journée normale.');

  return { score, level, recommendations };
}
