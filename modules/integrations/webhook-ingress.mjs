export function createWebhookIngress({verify,transform}={}){
  if(typeof verify!=='function'||typeof transform!=='function') throw new Error('verify and transform are required');
  return {
    async receive(request){
      const verified=await verify(request);
      if(!verified) return {accepted:false,reason:'invalid-signature'};
      return {accepted:true,event:await transform(structuredClone(request))};
    }
  };
}
