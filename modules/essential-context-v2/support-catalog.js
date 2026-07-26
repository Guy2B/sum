(function(g){
  const supports=[
    {id:'school-primary',label:'Scolarité primaire',group:'education'},
    {id:'school-secondary',label:'Collège et lycée',group:'education'},
    {id:'higher-education',label:'Études supérieures',group:'education'},
    {id:'homework',label:'Devoirs et révisions',group:'education'},
    {id:'exam-prep',label:'Préparation aux examens',group:'education'},
    {id:'school-difficulties',label:'Difficultés scolaires',group:'education'},
    {id:'orientation',label:'Orientation scolaire',group:'education'},
    {id:'job-search',label:'Recherche d’emploi',group:'career'},
    {id:'career-change',label:'Reconversion professionnelle',group:'career'},
    {id:'cv-cover-letter',label:'CV et lettre de motivation',group:'career'},
    {id:'interview-prep',label:'Préparation aux entretiens',group:'career'},
    {id:'application-tracking',label:'Suivi des candidatures',group:'career'},
    {id:'offer-comparison',label:'Comparaison des offres',group:'career'},
    {id:'salary-negotiation',label:'Négociation salariale',group:'career'},
    {id:'new-job-onboarding',label:'Prise de poste',group:'career'},
    {id:'family-organization',label:'Organisation familiale',group:'family'},
    {id:'administrative',label:'Gestion administrative',group:'life'},
    {id:'personal-finance',label:'Finances personnelles',group:'life'},
    {id:'health-routine',label:'Routine santé et bien-être',group:'health'},
    {id:'travel-planning',label:'Préparation de voyage',group:'life'}
  ];
  g.SigmaSupportCatalog={list:()=>supports.map(x=>({...x})),byGroup:g=>supports.filter(x=>x.group===g).map(x=>({...x})),find:id=>supports.find(x=>x.id===id)||null};
})(window);
