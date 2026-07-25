export const familySignalProfile = Object.freeze({
  id: 'family',
  domains: ['school', 'childcare', 'family-health', 'activities', 'household-admin'],
  keywords: ['école', 'enseignant', 'absence', 'cantine', 'sortie scolaire', 'crèche', 'vaccin', 'autorisation'],
  priorityBoosts: { school: 22, childcare: 22, 'family-health': 25 },
  criticalPatterns: ['enfant absent', 'urgence médicale', 'autorisation avant demain'],
  actionTemplates: { school: 'Répondre à l’école', 'family-health': 'Traiter le besoin de santé', activities: 'Confirmer l’activité' }
});

export const caregiverSignalProfile = Object.freeze({
  id: 'caregiver',
  domains: ['care', 'medical', 'medication', 'appointment', 'benefits'],
  keywords: ['aidant', 'ordonnance', 'médicament', 'médecin', 'rendez-vous', 'allocation', 'dossier'],
  priorityBoosts: { medication: 28, medical: 25, appointment: 18, benefits: 15 },
  criticalPatterns: ['traitement interrompu', 'urgence', 'rendez-vous annulé'],
  actionTemplates: { medication: 'Sécuriser le traitement', medical: 'Contacter le professionnel de santé', benefits: 'Compléter le dossier' }
});
