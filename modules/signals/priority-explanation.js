export function explainPriority(signal = {}, context = {}) {
  const reasons = [];
  if (signal.deadline) reasons.push(`Échéance détectée : ${signal.deadline}`);
  if ((signal.riskScore ?? 0) >= 70) reasons.push('Risque élevé en cas d’inaction');
  if ((signal.urgencyScore ?? 0) >= 70) reasons.push('Urgence élevée');
  if (context.activeEdition) reasons.push(`Profil actif : ${context.activeEdition}`);
  if (signal.source) reasons.push(`Source : ${signal.source}`);
  return {
    priority: signal.bucket ?? 'review',
    confidence: signal.confidence ?? 0.5,
    reasons
  };
}
