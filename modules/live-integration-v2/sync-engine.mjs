import {normalizeMessage} from './message-normalizer.mjs';
import {messageToSignal} from './signal-transformer.mjs';
import {rankSignals} from './priority-scorer.mjs';

export function createSyncEngine({
  registry,
  cursors,
  store,
  diagnostics,
  priorityOptions={}
}={}){
  if(!registry||!cursors||!store||!diagnostics) throw new Error('registry, cursors, store and diagnostics are required');

  return {
    async syncConnector(connectorId,context={}){
      const startedAt=new Date().toISOString();
      store.setStatus({syncing:true,lastSyncAt:startedAt,lastError:null});
      diagnostics.record({type:'sync-started',connectorId});

      try{
        const previous=cursors.get(connectorId)?.cursor??null;
        const result=await registry.sync(connectorId,previous,context);
        const rawMessages=Array.isArray(result)?result:(result.messages||[]);
        const normalized=rawMessages.map(item=>normalizeMessage({...item,source:item.source||connectorId}));
        const signals=rankSignals(normalized.map(messageToSignal),priorityOptions);

        store.upsertMessages(normalized);
        store.upsertSignals(signals);

        if(!Array.isArray(result)&&result.cursor!==undefined){
          cursors.set(connectorId,result.cursor,{count:normalized.length});
        }

        const completedAt=new Date().toISOString();
        store.setStatus({
          syncing:false,
          lastSuccessAt:completedAt,
          lastError:null,
          connectors:{
            ...store.getStatus().connectors,
            [connectorId]:{status:'connected',lastSyncAt:completedAt,count:normalized.length}
          }
        });
        diagnostics.record({type:'sync-completed',connectorId,count:normalized.length});
        return {ok:true,count:normalized.length,messages:normalized,signals};
      }catch(error){
        store.setStatus({
          syncing:false,
          lastError:error.message,
          connectors:{
            ...store.getStatus().connectors,
            [connectorId]:{status:'error',lastError:error.message}
          }
        });
        diagnostics.record({type:'sync-failed',connectorId,error:error.message});
        return {ok:false,error:error.message,count:0,messages:[],signals:[]};
      }
    }
  };
}
