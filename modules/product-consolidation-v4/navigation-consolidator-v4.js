(function(g){
  const state={applied:false};
  function setText(selector,value){const el=document.querySelector(selector);if(el)el.textContent=value;}
  function hide(selector){document.querySelectorAll(selector).forEach(el=>{el.hidden=true;el.setAttribute('aria-hidden','true');});}
  function show(selector){document.querySelectorAll(selector).forEach(el=>{el.hidden=false;el.removeAttribute('aria-hidden');});}
  function consolidate(){
    setText('[data-panel="context"] [data-i18n="context.nav"]','Essentiel');
    setText('[data-panel="journal"] [data-i18n="nav.journal"]','Mon parcours');
    hide('[data-panel="learning"]');
    document.querySelectorAll('[data-panel="journal"]').forEach(el=>el.dataset.consolidatedJourney='true');
    state.applied=true;
    window.dispatchEvent(new CustomEvent('sigma:navigation-consolidated',{detail:{...state}}));
    return {...state};
  }
  function restore(){
    show('[data-panel="learning"]');
    state.applied=false;
    return {...state};
  }
  g.SigmaNavigationConsolidatorV4={consolidate,restore,state};
})(window);
