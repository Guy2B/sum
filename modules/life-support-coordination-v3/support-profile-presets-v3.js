(function(g){
  const presets=[
    {id:'school-child',label:'Enfant scolarisé',icon:'🎒',goals:['Suivi scolaire','Rythme familial','Échéances']},
    {id:'parent-caregiver',label:'Parent ou aidant',icon:'🤝',goals:['Coordination','Charge mentale','Rendez-vous']},
    {id:'job-seeker',label:'Recherche d’emploi',icon:'💼',goals:['Candidatures','Entretiens','Relances']},
    {id:'student',label:'Étudiant',icon:'🎓',goals:['Cours','Examens','Budget']},
    {id:'senior-support',label:'Accompagnement d’un proche',icon:'🌿',goals:['Santé','Administratif','Présence']},
    {id:'new-parent',label:'Nouveau parent',icon:'🍼',goals:['Sommeil','Santé','Organisation']},
    {id:'career-transition',label:'Transition professionnelle',icon:'🧭',goals:['Compétences','Réseau','Décisions']},
    {id:'moving-home',label:'Déménagement',icon:'📦',goals:['Logistique','Budget','Démarches']}
  ];
  g.SigmaSupportProfilePresetsV3={list:()=>presets.map(x=>({...x})),find:id=>presets.find(x=>x.id===id)||null};
})(window);
