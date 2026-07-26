(function(g){
  const presets=[
    {id:'none',label:'Aucun accompagnement actif',description:'Commencer sans accompagnement particulier.',category:'general'},
    {id:'school-support',label:'Accompagnement scolaire',description:'Suivi des études, devoirs, examens et besoins scolaires.',category:'school'},
    {id:'job-search-support',label:'Accompagnement recherche d’emploi',description:'Candidatures, relances, entrevues et objectifs.',category:'career'},
    {id:'family-coordination',label:'Coordination familiale',description:'Responsabilités, rendez-vous et répartition de la charge.',category:'family'},
    {id:'care-support',label:'Accompagnement santé ou soins',description:'Rendez-vous, suivi et coordination avec les proches.',category:'care'},
    {id:'personal-coaching',label:'Coaching personnel',description:'Objectifs, habitudes, motivation et équilibre.',category:'personal'}
  ];
  function list(){return presets.map(x=>({...x}));}
  function get(id){return presets.find(x=>x.id===id)||null;}
  function suggested(lifeProfileIds=[]){
    const out=[];
    if(lifeProfileIds.includes('student'))out.push(get('school-support'));
    if(lifeProfileIds.includes('job-search'))out.push(get('job-search-support'));
    if(lifeProfileIds.includes('family'))out.push(get('family-coordination'));
    if(lifeProfileIds.includes('caregiver'))out.push(get('care-support'));
    if(lifeProfileIds.includes('personal'))out.push(get('personal-coaching'));
    return out.filter(Boolean);
  }
  g.SigmaSupportProfileProposalsV1={presets,list,get,suggested};
})(window);
