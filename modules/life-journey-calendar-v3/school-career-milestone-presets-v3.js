(function(g){
  const presets=[
    {id:'school-exam',type:'education',label:'Examen ou contrôle',icon:'📝'},
    {id:'school-meeting',type:'education',label:'Réunion avec l’établissement',icon:'🏫'},
    {id:'orientation-deadline',type:'education',label:'Échéance d’orientation',icon:'🧭'},
    {id:'application-deadline',type:'career',label:'Date limite de candidature',icon:'📨'},
    {id:'interview',type:'career',label:'Entretien professionnel',icon:'💬'},
    {id:'job-start',type:'career',label:'Prise de poste',icon:'🚀'},
    {id:'housing',type:'life',label:'Échéance logement',icon:'🏠'},
    {id:'health-appointment',type:'health',label:'Rendez-vous santé',icon:'❤️'}
  ];
  g.SigmaMilestonePresetsV3={list:()=>presets.map(x=>({...x})),find:id=>presets.find(x=>x.id===id)||null};
})(window);
