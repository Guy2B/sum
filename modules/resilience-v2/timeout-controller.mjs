export async function withTimeout(operation,{
  timeoutMs=1000,
  timeoutMessage='operation timed out'
}={}){
  let timer;
  try{
    return await Promise.race([
      Promise.resolve().then(operation),
      new Promise((_,reject)=>{
        timer=setTimeout(()=>reject(new Error(timeoutMessage)),timeoutMs);
      })
    ]);
  }finally{
    clearTimeout(timer);
  }
}
