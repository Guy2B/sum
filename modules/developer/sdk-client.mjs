export function createSdkClient({transport,basePath='/api/v1'}={}){
  if(typeof transport!=='function') throw new Error('transport is required');
  return {
    request(method,path,{body=null,headers={}}={}){
      return transport({
        method:String(method).toUpperCase(),
        path:`${basePath}${path}`,
        body:structuredClone(body),
        headers:structuredClone(headers)
      });
    },
    get(path,options){return this.request('GET',path,options);},
    post(path,options){return this.request('POST',path,options);}
  };
}
