export function createFallbackRegistry(){
  const fallbacks=new Map();

  return {
    register(key,handler){
      if(!key||typeof handler!=='function') throw new Error('fallback key and handler are required');
      fallbacks.set(key,handler);
      return key;
    },
    async execute(key,input={},context={}){
      const handler=fallbacks.get(key);
      if(!handler) throw new Error(`unknown fallback: ${key}`);
      return handler(structuredClone(input),structuredClone(context));
    },
    has(key){return fallbacks.has(key);}
  };
}
