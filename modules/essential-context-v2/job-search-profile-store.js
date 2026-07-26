(function(g){
  const KEY='sigma-job-search-profile-v2';
  const defaults={status:'exploring',targetRoles:[],targetSectors:[],locations:[],salaryRange:null,remotePreference:'hybrid',confidential:false,applications:[]};
  function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{return {...defaults};}}
  function save(value){const next={...defaults,...value,updatedAt:new Date().toISOString()};localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new CustomEvent('sigma:job-profile-updated',{detail:next}));return next;}
  function addApplication(application){const value=load();value.applications.unshift({id:crypto.randomUUID(),status:'planned',createdAt:new Date().toISOString(),...application});return save(value);}
  g.SigmaJobSearchProfile={load,save,addApplication};
})(window);
