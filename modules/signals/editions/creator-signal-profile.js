export const creatorSignalProfile = Object.freeze({
  id: 'creator',
  domains: ['partnership', 'client', 'publishing', 'rights', 'revenue'],
  keywords: ['brief', 'sponsor', 'partenariat', 'livrable', 'publication', 'copyright', 'droits', 'paiement'],
  priorityBoosts: { client: 18, rights: 22, revenue: 20, publishing: 12 },
  criticalPatterns: ['mise en demeure', 'retrait de contenu', 'paiement en retard'],
  actionTemplates: { client: 'Répondre au client', publishing: 'Préparer la publication', revenue: 'Suivre le paiement' }
});
