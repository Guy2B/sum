export const LIFE_CONTEXTS = {
  jobSeeker: { domains:['employment'], boost:['recruteur','entretien','candidature','offre','france travail','job','emploi'] },
  family: { domains:['family','school'], boost:['école','college','collège','lycée','crèche','enseignant','cantine','sortie scolaire','parent'] },
  administration: { domains:['administration','finance'], boost:['facture','relance','amende','impôt','taxe','cpam','caf','urssaf','assurance','banque'] },
  health: { domains:['health'], boost:['médecin','hôpital','rendez-vous','ordonnance','analyse','mutuelle'] }
};
export function activeKeywords(contexts=[]) { return contexts.flatMap(c => LIFE_CONTEXTS[c]?.boost || []); }
