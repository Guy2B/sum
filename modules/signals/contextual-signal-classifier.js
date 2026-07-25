const RULES = [
  ['employment',['recruteur','entretien','candidature','offre d’emploi','offre emploi','france travail']],
  ['school',['école','collège','lycée','crèche','cantine','enseignant','sortie scolaire']],
  ['finance',['facture','prélèvement','paiement','impayé','banque','remboursement']],
  ['administration',['amende','contravention','impôt','taxe','cpam','caf','urssaf','mise en demeure']],
  ['health',['médecin','hôpital','ordonnance','analyse médicale','mutuelle']],
  ['family',['enfant','parent','famille']], ['calendar',['rendez-vous','réunion','invitation']]
];
export function classifySignal(signal, profileKeywords=[]) {
  const text = `${signal.title||''} ${signal.body||''} ${signal.sender||''}`.toLocaleLowerCase('fr');
  const scored = RULES.map(([domain, words]) => ({ domain, score: words.filter(w => text.includes(w)).length }));
  const contextualBoost = profileKeywords.filter(w => text.includes(w)).length;
  scored.sort((a,b)=>b.score-a.score);
  return { domain: scored[0]?.score ? scored[0].domain : 'general', confidence: Math.min(1, (scored[0]?.score || 0)*0.28 + contextualBoost*0.12), contextualBoost };
}
