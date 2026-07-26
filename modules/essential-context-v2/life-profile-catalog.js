(function(g){
  const profiles=[
    {id:'parent',label:'Parent ou responsable familial',icon:'👨‍👩‍👧‍👦'},
    {id:'student',label:'Étudiant ou élève',icon:'🎓'},
    {id:'employee',label:'Salarié',icon:'💼'},
    {id:'job-seeker',label:'Recherche d’emploi',icon:'🔎'},
    {id:'entrepreneur',label:'Entrepreneur ou indépendant',icon:'🚀'},
    {id:'caregiver',label:'Aidant familial',icon:'🤝'},
    {id:'retired',label:'Retraité',icon:'🌿'},
    {id:'health-support',label:'Santé ou limitation durable',icon:'❤️'},
    {id:'new-parent',label:'Nouveau parent',icon:'🍼'},
    {id:'single-parent',label:'Famille monoparentale',icon:'🏠'},
    {id:'moving',label:'Déménagement',icon:'📦'},
    {id:'housing-search',label:'Recherche de logement',icon:'🏡'},
    {id:'transition',label:'Transition de vie',icon:'🧭'}
  ];
  g.SigmaLifeProfileCatalog={list:()=>profiles.map(x=>({...x})),find:id=>profiles.find(x=>x.id===id)||null};
})(window);
