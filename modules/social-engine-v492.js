'use strict';
(() => {
  const providers=new Map();
  let syncing=false;
  function register(name,adapter){if(!name||!adapter||typeof adapter.sync!=='function')throw new TypeError('A social adapter needs a name and sync()');providers.set(name,Object.freeze(adapter));window.dispatchEvent(new CustomEvent('sigma:social-provider-registered',{detail:{provider:name}}));return true;}
  function listProviders(){return [...providers.entries()].map(([name,a])=>({name,version:a.version||'',capabilities:a.capabilities||[],configured:typeof a.isConfigured==='function'?Boolean(a.isConfigured()):true}));}
  function ingest(provider,payload){const model=window.SigmaSocialModel,storage=window.SigmaSocialStorage;if(!model||!storage)throw new Error('Social Engine dependencies are unavailable');const data=model.normaliseProviderPayload(provider,payload);for(const key of ['accounts','posts','messages','comments','metrics','notifications'])storage.upsertMany(key,data[key]);storage.markSync(data.syncedAt);return data;}
  async function syncProvider(name){const adapter=providers.get(name);if(!adapter)throw new Error(`Provider ${name} is not registered`);if(typeof adapter.isConfigured==='function'&&!adapter.isConfigured())return{name,status:'configuration-required'};const payload=await adapter.sync();ingest(name,payload||{});return{name,status:'synced',payload};}
  async function syncAll(){if(syncing)return{status:'already-running'};syncing=true;window.dispatchEvent(new CustomEvent('sigma:social-sync-state',{detail:{syncing:true}}));const results=[];try{for(const name of providers.keys()){try{results.push(await syncProvider(name));}catch(error){console.error(`[SigmaSocialEngine] ${name}`,error);results.push({name,status:'error',message:error.message});}}return{status:'complete',results,summary:window.SigmaSocialStorage?.summary?.()||{}};}finally{syncing=false;window.dispatchEvent(new CustomEvent('sigma:social-sync-state',{detail:{syncing:false,results}}));}}
  function snapshot(){return window.SigmaSocialStorage?.load?.()||{};}
  window.SigmaSocialEngine=Object.freeze({version:'4.9.2',register,listProviders,ingest,syncProvider,syncAll,snapshot,summary:()=>window.SigmaSocialStorage?.summary?.()||{}});
})();
