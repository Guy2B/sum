(function(g){
  function boot(){
    window.addEventListener('sigma:automation-reminder',e=>{
      const d=e.detail||{};
      const title=d.type==='approval'?'Approbations en attente':'Actions en retard';
      window.SigmaAutomationNotifications.push({title,message:`${d.count||0} élément(s) détecté(s)`,severity:d.count>0?'warning':'info'});
    });
    window.addEventListener('sigma:execution-completed',e=>{
      window.SigmaAutomationNotifications.push({title:'Exécution terminée',message:e.detail?.operation||'Action exécutée',severity:e.detail?.ok?'success':'error'});
    });
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
  g.SigmaAutomationEventBridge={boot};
})(window);
