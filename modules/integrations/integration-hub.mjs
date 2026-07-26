export function createIntegrationHub(){const providers=new Map();return{
  register(provider,factory){providers.set(provider.id,{provider,factory});},
  create(providerId,config){const entry=providers.get(providerId);if(!entry)throw new Error('unknown provider');return entry.factory(config);},
  list(){return [...providers.values()].map(x=>structuredClone(x.provider));}
}}
