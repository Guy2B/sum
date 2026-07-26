export function createCircuitBreaker({
  failureThreshold=3,
  resetTimeoutMs=30000,
  now=()=>Date.now()
}={}){
  let state='closed';
  let failures=0;
  let openedAt=null;

  return {
    canExecute(){
      if(state==='open'&&now()-openedAt>=resetTimeoutMs){
        state='half-open';
      }
      return state!=='open';
    },
    success(){
      state='closed';
      failures=0;
      openedAt=null;
      return state;
    },
    failure(){
      failures+=1;
      if(failures>=failureThreshold){
        state='open';
        openedAt=now();
      }
      return state;
    },
    snapshot(){return {state,failures,openedAt};}
  };
}
