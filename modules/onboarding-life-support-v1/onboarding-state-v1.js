(function(g){
  const KEY='sigma:onboarding-life-support:v1';
  const defaults={
    version:1,
    status:'pending',
    step:'welcome',
    selectedLifeProfiles:[],
    selectedSupportProfiles:[],
    completedAt:null,
    skippedAt:null,
    updatedAt:null
  };
  function read(){
    try{return{...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')};}
    catch{return{...defaults};}
  }
  function write(patch){
    const value={...read(),...patch,updatedAt:new Date().toISOString()};
    localStorage.setItem(KEY,JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('sigma:onboarding-state-updated',{detail:value}));
    return value;
  }
  function complete(){
    return write({status:'completed',step:'done',completedAt:new Date().toISOString(),skippedAt:null});
  }
  function skip(){
    return write({status:'skipped',step:'done',skippedAt:new Date().toISOString()});
  }
  function reset(){
    localStorage.removeItem(KEY);
    return read();
  }
  function shouldRun(){
    const s=read();
    return !['completed','skipped'].includes(s.status);
  }
  g.SigmaOnboardingStateV1={KEY,defaults,read,write,complete,skip,reset,shouldRun};
})(window);
