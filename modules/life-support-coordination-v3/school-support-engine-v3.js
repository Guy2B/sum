(function(g){
  function assess(input={}){
    const alerts=[];let score=100;
    if((input.missedAssignments||0)>1){alerts.push({type:'assignments',severity:'high',message:'Plusieurs devoirs sont en retard.'});score-=25;}
    if((input.absences||0)>2){alerts.push({type:'attendance',severity:'medium',message:'Les absences méritent une vérification.'});score-=15;}
    if((input.nextExamDays??99)<=7){alerts.push({type:'exam',severity:'medium',message:'Un examen approche cette semaine.'});score-=10;}
    if((input.sleepHours??8)<7){alerts.push({type:'sleep',severity:'medium',message:'Le sommeil peut fragiliser l’apprentissage.'});score-=10;}
    return{score:Math.max(0,score),alerts,priority:alerts[0]||null};
  }
  function nextActions(input){const r=assess(input);const actions=[];for(const a of r.alerts){if(a.type==='assignments')actions.push('Planifier un créneau de rattrapage');if(a.type==='attendance')actions.push('Contacter l’établissement');if(a.type==='exam')actions.push('Préparer un plan de révision');if(a.type==='sleep')actions.push('Protéger l’heure du coucher');}return actions;}
  g.SigmaSchoolSupportEngineV3={assess,nextActions};
})(window);
