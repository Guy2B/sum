export async function executeWithRetry(operation,{maxAttempts=3,baseDelayMs=0,shouldRetry=()=>true}={}){
  let lastError;
  let attempts=0;
  for(let attempt=1;attempt<=maxAttempts;attempt++){
    attempts=attempt;
    try{
      return {ok:true,value:await operation(attempt),attempts};
    }catch(error){
      lastError=error;
      if(attempt>=maxAttempts||!shouldRetry(error,attempt)) break;
      if(baseDelayMs>0) await new Promise(resolve=>setTimeout(resolve,baseDelayMs*(2**(attempt-1))));
    }
  }
  return {ok:false,error:lastError,attempts};
}
