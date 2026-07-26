(function(g){
  const templates=[
    {id:'tpl:daily-refresh',name:'Actualisation quotidienne',rule:{trigger:{type:'daily',hour:8,minute:0},action:{type:'refresh-command-center'}}},
    {id:'tpl:approval-watch',name:'Surveillance des approbations',rule:{trigger:{type:'interval',minutes:60},condition:{metric:'pendingApprovals',operator:'gte',value:1},action:{type:'approval-reminder'}}},
    {id:'tpl:focus-task',name:'Créer une tâche depuis le focus',rule:{trigger:{type:'daily',hour:9,minute:0},condition:{metric:'openActions',operator:'gte',value:1},action:{type:'create-task-from-focus'}}},
    {id:'tpl:stale-watch',name:'Surveillance des retards',rule:{trigger:{type:'interval',minutes:120},action:{type:'scan-stale-actions'}}}
  ];
  function list(){return templates.map(x=>JSON.parse(JSON.stringify(x)));}
  function instantiate(templateId){
    const template=templates.find(x=>x.id===templateId);
    if(!template)return null;
    return{id:`rule:${crypto.randomUUID()}`,name:template.name,enabled:true,lastRunAt:null,...JSON.parse(JSON.stringify(template.rule))};
  }
  g.SigmaAutomationTemplates={list,instantiate};
})(window);
