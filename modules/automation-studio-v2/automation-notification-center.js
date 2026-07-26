(function(g){
  const KEY='sigma-automation-notifications-v2';
  function list(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return[];}}
  function push(notification){const rows=list();rows.unshift({id:crypto.randomUUID(),at:new Date().toISOString(),read:false,...notification});localStorage.setItem(KEY,JSON.stringify(rows.slice(0,200)));window.dispatchEvent(new CustomEvent('sigma:automation-notification',{detail:rows[0]}));return rows[0];}
  function markRead(id){const rows=list().map(x=>x.id===id?{...x,read:true}:x);localStorage.setItem(KEY,JSON.stringify(rows));return rows;}
  g.SigmaAutomationNotifications={list,push,markRead};
})(window);
