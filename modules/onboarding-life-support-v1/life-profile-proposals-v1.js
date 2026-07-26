(function(g){
  const presets=[
    {id:'personal',label:'Vie personnelle',description:'Équilibre, habitudes et priorités personnelles.',icon:'◎',recommended:true},
    {id:'family',label:'Vie familiale',description:'Organisation familiale, proches et responsabilités.',icon:'⌂',recommended:false},
    {id:'student',label:'Études',description:'Cours, examens, apprentissages et progression.',icon:'◫',recommended:false},
    {id:'career',label:'Carrière',description:'Travail, développement professionnel et objectifs.',icon:'◇',recommended:true},
    {id:'job-search',label:'Recherche d’emploi',description:'Candidatures, suivis et préparation des entretiens.',icon:'↗',recommended:false},
    {id:'caregiver',label:'Proche aidant',description:'Coordination des soins et charge d’accompagnement.',icon:'♡',recommended:false}
  ];
  function list(){return presets.map(x=>({...x}));}
  function get(id){return presets.find(x=>x.id===id)||null;}
  function suggested(context={}){
    const ids=new Set(presets.filter(x=>x.recommended).map(x=>x.id));
    const text=JSON.stringify(context).toLowerCase();
    if(/famille|enfant|parent|household/.test(text))ids.add('family');
    if(/étud|school|student|cours/.test(text))ids.add('student');
    if(/emploi|job|candidature|interview/.test(text))ids.add('job-search');
    if(/aidant|care|soin|support/.test(text))ids.add('caregiver');
    return [...ids].map(get).filter(Boolean);
  }
  g.SigmaLifeProfileProposalsV1={presets,list,get,suggested};
})(window);
