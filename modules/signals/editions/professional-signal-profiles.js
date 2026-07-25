export const freelancerSignalProfile = Object.freeze({
  id: 'freelancer',
  domains: ['client', 'quote', 'invoice', 'tax', 'contract'],
  keywords: ['devis', 'facture', 'impayé', 'client', 'contrat', 'tva', 'urssaf'],
  priorityBoosts: { invoice: 22, tax: 25, client: 16, contract: 18 },
  criticalPatterns: ['mise en demeure', 'impayé', 'échéance tva'],
  actionTemplates: { invoice: 'Relancer ou régler la facture', client: 'Répondre au client', tax: 'Préparer la déclaration' }
});

export const smallBusinessSignalProfile = Object.freeze({
  id: 'small-business',
  domains: ['cashflow', 'customer', 'supplier', 'payroll', 'compliance'],
  keywords: ['trésorerie', 'client', 'fournisseur', 'paie', 'conformité', 'contrôle'],
  priorityBoosts: { cashflow: 25, payroll: 25, compliance: 22, customer: 14 },
  criticalPatterns: ['solde insuffisant', 'paie bloquée', 'contrôle urgent'],
  actionTemplates: { cashflow: 'Sécuriser la trésorerie', payroll: 'Traiter la paie', compliance: 'Répondre à l’obligation' }
});
