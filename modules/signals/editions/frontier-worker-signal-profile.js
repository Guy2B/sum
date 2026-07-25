export const frontierWorkerSignalProfile = Object.freeze({
  id: 'frontier-worker',
  domains: ['cross-border-tax', 'permit', 'health-insurance', 'transport', 'payroll', 'currency'],
  keywords: ['frontalier', 'permis', 'impôt', 'fiscal', 'caisse maladie', 'assurance maladie', 'train', 'trafic', 'fiche de paie', 'change'],
  priorityBoosts: { 'cross-border-tax': 25, permit: 25, 'health-insurance': 20, payroll: 15, transport: 8 },
  criticalPatterns: ['expiration du permis', 'délai fiscal', 'couverture suspendue'],
  actionTemplates: { permit: 'Renouveler le document', 'cross-border-tax': 'Traiter l’échéance fiscale', transport: 'Adapter le trajet' }
});
