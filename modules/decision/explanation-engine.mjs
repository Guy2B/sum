export function explainRecommendation({ recommended, ranked, context } = {}) {
  const runnerUp = ranked?.[1] || null;
  const reasons = [];

  if (recommended?.outcome?.benefit >= 0.6) reasons.push('Cette option maximise l’impact attendu.');
  if (recommended?.outcome?.risk <= 0.35) reasons.push('Son niveau de risque reste maîtrisé.');
  if ((recommended?.outcome?.effortMinutes || 0) <= 45) reasons.push('Elle reste compatible avec un effort court.');
  if (context?.constraints?.deadline) reasons.push('L’échéance déclarée a été prise en compte.');
  if (!reasons.length) reasons.push('Cette option présente le meilleur compromis global.');

  return {
    headline: `Recommandation : ${recommended?.option?.label || 'aucune'}`,
    summary: reasons.join(' '),
    whyNotAlternative: runnerUp
      ? `${runnerUp.option.label} obtient un score inférieur (${runnerUp.tradeoff.score}/100).`
      : 'Aucune alternative comparable disponible.',
    evidence: {
      score: recommended?.tradeoff?.score || 0,
      benefit: recommended?.tradeoff?.components?.benefit || 0,
      risk: recommended?.tradeoff?.components?.risk || 0,
      confidence: Math.round((recommended?.outcome?.confidence || 0) * 100),
    },
  };
}
