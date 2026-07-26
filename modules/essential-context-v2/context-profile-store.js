(function(g){
  const KEY='sigma-essential-context-v2';
  const defaults={
    edition:'general',
    lifeProfiles:[],
    activeSupports:[],
    responsePreferences:{tone:'balanced',depth:'guided',format:'structured'},
    household:[],
    goals:[],
    constraints:[],
    updatedAt:null
  };
  function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{return {...defaults};}}
  function save(value){const next={...defaults,...value,updatedAt:new Date().toISOString()};localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new CustomEvent('sigma:context-updated',{detail:next}));return next;}
  function patch(patch){return save({...load(),...patch});}
  g.SigmaContextProfile={load,save,patch,defaults:()=>JSON.parse(JSON.stringify(defaults))};
})(window);
