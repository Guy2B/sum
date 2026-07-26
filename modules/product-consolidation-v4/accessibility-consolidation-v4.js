(function(g){
  function audit(){
    const buttons=[...document.querySelectorAll('button')];
    const images=[...document.querySelectorAll('img')];
    const dialogs=[...document.querySelectorAll('dialog')];
    const issues=[];
    buttons.filter(x=>!(x.textContent||'').trim()&&!x.getAttribute('aria-label')&&!x.getAttribute('title')).forEach(x=>issues.push({type:'button-name',id:x.id||''}));
    images.filter(x=>!x.hasAttribute('alt')).forEach(x=>issues.push({type:'image-alt',src:x.getAttribute('src')||''}));
    dialogs.filter(x=>!x.getAttribute('aria-label')&&!x.querySelector('h1,h2,h3')).forEach(x=>issues.push({type:'dialog-name',id:x.id||''}));
    return{ok:issues.length===0,issues,checkedAt:new Date().toISOString()};
  }
  g.SigmaAccessibilityConsolidationV4={audit};
})(window);
