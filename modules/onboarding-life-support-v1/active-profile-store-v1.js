(function(g){
  const KEY='sigma:active-life-support:v1';
  const defaults={lifeProfiles:[],supportProfiles:[],updatedAt:null};
  function read(){
    try{return{...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')};}
    catch{return{...defaults};}
  }
  function write(value){
    const next={...read(),...value,updatedAt:new Date().toISOString()};
    localStorage.setItem(KEY,JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('sigma:active-life-support-updated',{detail:next}));
    return next;
  }
  function activateLife(ids){
    const valid=[...new Set(ids)].filter(id=>window.SigmaLifeProfileProposalsV1.get(id));
    return write({lifeProfiles:valid});
  }
  function activateSupport(ids){
    const valid=[...new Set(ids)].filter(id=>id!=='none'&&window.SigmaSupportProfileProposalsV1.get(id));
    return write({supportProfiles:valid});
  }
  function replace(lifeProfiles,supportProfiles){
    return write({lifeProfiles:[...new Set(lifeProfiles)],supportProfiles:[...new Set(supportProfiles.filter(x=>x!=='none'))]});
  }
  function detailed(){
    const state=read();
    return{
      ...state,
      lifeProfiles:state.lifeProfiles.map(window.SigmaLifeProfileProposalsV1.get).filter(Boolean),
      supportProfiles:state.supportProfiles.map(window.SigmaSupportProfileProposalsV1.get).filter(Boolean)
    };
  }
  g.SigmaActiveProfileStoreV1={KEY,read,write,activateLife,activateSupport,replace,detailed};
})(window);
