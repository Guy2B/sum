(function(g){
  const KEY='sigma-automation-rules-v2';
  const DEFAULTS=[
    {id:'rule:daily-brief',name:'Brief quotidien',enabled:true,trigger:{type:'daily',hour:8,minute:0},action:{type:'rebuild-command-center'},lastRunAt:null},
    {id:'rule:approval-reminder',name:'Relance des approbations',enabled:true,trigger:{type:'interval',minutes:60},action:{type:'approval-reminder'},lastRunAt:null},
    {id:'rule:stale-actions',name:'Détection des actions en retard',enabled:true,trigger:{type:'interval',minutes:120},action:{type:'scan-stale-actions'},lastRunAt:null}
  ];
  function list(){try{const rows=JSON.parse(localStorage.getItem(KEY)||'null');return Array.isArray(rows)?rows:DEFAULTS;}catch{return DEFAULTS;}}
  function save(rows){localStorage.setItem(KEY,JSON.stringify(rows));return rows;}
  function upsert(rule){const rows=list();const index=rows.findIndex(x=>x.id===rule.id);if(index>=0)rows[index]={...rows[index],...rule};else rows.push(rule);return save(rows);}
  function remove(id){return save(list().filter(x=>x.id!==id));}
  function toggle(id,enabled){return save(list().map(x=>x.id===id?{...x,enabled}:x));}
  g.SigmaAutomationRules={list,save,upsert,remove,toggle,defaults:()=>DEFAULTS.map(x=>({...x}))};
})(window);
