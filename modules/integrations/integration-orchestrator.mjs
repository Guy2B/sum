import {fetchDelta} from './delta-fetcher.mjs';
import {normalizeExternalItem} from './normalization-pipeline.mjs';
import {createImportBatch} from './import-batch.mjs';
import {createConnectorAudit} from './connector-audit.mjs';

export function createIntegrationOrchestrator({provider,accountId,kind,fetchPage}={}) {
  const audit=createConnectorAudit();
  return {
    async sync({cursor=null}={}){
      audit.record({type:'sync-started',provider,accountId});
      const delta=await fetchDelta(fetchPage,{cursor});
      const normalized=delta.items.map(item=>normalizeExternalItem(item,{provider,kind}));
      const batch=createImportBatch(normalized,{provider,accountId});
      audit.record({type:'sync-completed',provider,accountId,count:normalized.length});
      return {batch,nextCursor:delta.nextCursor,pages:delta.pages,truncated:delta.truncated};
    },
    audit(){return audit.list({provider,accountId});}
  };
}
