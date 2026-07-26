import {fetchDelta} from './delta-fetcher.mjs';
import {normalizeExternalItem} from './normalization-pipeline.mjs';
import {createImportBatch} from './import-batch.mjs';
import {createConnectorAudit} from './connector-audit.mjs';
import {evaluateConnectorHealth} from './connector-health.mjs';

export function createIntegrationOrchestrator(config={}){
  /*
   * Contrat historique (Sprint 252):
   *   createIntegrationOrchestrator({provider,accountId,kind,fetchPage})
   *   .sync({cursor}) -> {batch,nextCursor,pages,truncated}
   *
   * Nouveau contrat (Sprints 315-329):
   *   createIntegrationOrchestrator()
   *   .register(id,adapter)
   *   .sync(id,options) -> {records,nextCursor}
   */
  const legacyMode=typeof config?.fetchPage==='function';
  const connectors=new Map();
  const states=new Map();
  const legacyAudit=createConnectorAudit();

  function register(id,adapter){
    if(typeof id==='object' && adapter===undefined){
      adapter=id;
      id=adapter.id || adapter.name || 'default';
    }
    if(!id||!adapter) throw new Error('id and adapter are required');
    connectors.set(id,adapter);
    states.set(id,{lastSuccessAt:null,lastError:null,latencyMs:null});
    return id;
  }

  if(!legacyMode){
    if(config?.connector) register(config.connectorId || config.connector.id || 'default', config.connector);
    if(config?.adapter) register(config.connectorId || config.adapter.id || 'default', config.adapter);
    if(Array.isArray(config?.connectors)){
      for(const entry of config.connectors){
        if(entry?.adapter) register(entry.id || entry.adapter.id || `connector_${connectors.size+1}`,entry.adapter);
        else register(entry);
      }
    }else if(config?.connectors && typeof config.connectors==='object'){
      for(const [id,adapter] of Object.entries(config.connectors)) register(id,adapter);
    }
  }

  async function legacySync({cursor=null}={}){
    const {provider,accountId,kind,fetchPage}=config;
    legacyAudit.record({type:'sync-started',provider,accountId});
    const delta=await fetchDelta(fetchPage,{cursor});
    const normalized=delta.items.map(item=>normalizeExternalItem(item,{provider,kind}));
    const batch=createImportBatch(normalized,{provider,accountId});
    legacyAudit.record({type:'sync-completed',provider,accountId,count:normalized.length});
    return {
      batch,
      nextCursor:delta.nextCursor,
      pages:delta.pages,
      truncated:delta.truncated
    };
  }

  async function modernSync(id,options={}){
    if(id && typeof id==='object'){
      options=id;
      id=undefined;
    }
    if(id===undefined || id===null || id===''){
      if(connectors.size===1) id=[...connectors.keys()][0];
      else if(connectors.has('default')) id='default';
    }

    const adapter=connectors.get(id);
    if(!adapter) throw new Error(`unknown connector: ${id}`);

    const started=Date.now();
    try{
      let page;
      if(typeof adapter.listSignals==='function') page=await adapter.listSignals(options);
      else if(typeof adapter.sync==='function') page=await adapter.sync(options);
      else if(typeof adapter.fetch==='function') page=await adapter.fetch(options);
      else throw new Error('connector does not provide listSignals, sync or fetch');

      const sourceItems=Array.isArray(page)?page:(page?.items||page?.records||page?.signals||[]);
      const records=sourceItems.map(item=>
        typeof adapter.normalize==='function' ? adapter.normalize(item) : structuredClone(item)
      );

      states.set(id,{
        lastSuccessAt:new Date().toISOString(),
        lastError:null,
        latencyMs:Date.now()-started
      });

      return {
        records,
        items:records,
        signals:records,
        nextCursor:page?.nextCursor||page?.cursor||null
      };
    }catch(error){
      states.set(id,{
        lastSuccessAt:states.get(id)?.lastSuccessAt||null,
        lastError:error.message,
        latencyMs:Date.now()-started
      });
      throw error;
    }
  }

  return {
    register,

    async sync(id,options={}){
      if(legacyMode){
        // Dans l'ancien contrat, le premier argument est l'objet d'options.
        return legacySync(id && typeof id==='object' ? id : options);
      }
      return modernSync(id,options);
    },

    health(id){
      if(legacyMode){
        const entries=legacyAudit.list({provider:config.provider,accountId:config.accountId});
        const completed=[...entries].reverse().find(entry=>entry.type==='sync-completed');
        return completed
          ? {status:'healthy',lastSuccessAt:completed.timestamp||null}
          : {status:'unknown',reason:'never-synced'};
      }
      if((id===undefined||id===null) && connectors.size===1) id=[...connectors.keys()][0];
      return evaluateConnectorHealth(states.get(id)||{});
    },

    list(){
      return legacyMode ? [config.provider].filter(Boolean) : [...connectors.keys()];
    },

    audit(){
      return legacyMode
        ? legacyAudit.list({provider:config.provider,accountId:config.accountId})
        : [];
    }
  };
}
