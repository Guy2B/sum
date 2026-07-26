export function routeModel(providers=[],request={}){
  const required=request.requiredCapabilities||[];
  const candidates=providers.filter(provider=>required.every(cap=>provider.capabilities.includes(cap)));
  if(!candidates.length) throw new Error('no compatible model provider');
  return candidates.sort((a,b)=>(b.priority||0)-(a.priority||0))[0];
}
