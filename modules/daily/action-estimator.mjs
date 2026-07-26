const DURATION_HINTS = [
  [/\b(projet|livrable|publication)\b/i, 90],
  [/\b(candidature|cv|lettre)\b/i, 75],
  [/\b(entretien|réunion)\b/i, 60],
  [/\b(préparer|document|dossier)\b/i, 45],
  [/\b(répondre|envoyer)\b/i, 25],
  [/\b(payer|régler|vérifier une facture)\b/i, 20],
  [/\b(appel|téléphoner|confirmer)\b/i, 15],
];

export function estimateAction(action = {}) {
  const text = `${action.title || ''} ${action.description || ''}`;
  const hinted = DURATION_HINTS.find(([pattern]) => pattern.test(text));
  const estimatedMinutes = Number(action.estimatedMinutes) || hinted?.[1] || 30;
  const energy = action.energy || (
    /appel|réponse|administratif/i.test(text) ? "medium" :
    /projet|candidature|préparer/i.test(text) ? "high" : "low"
  );

  return {
    ...action,
    estimatedMinutes,
    energy,
    splittable: action.splittable ?? estimatedMinutes > 60,
  };
}
