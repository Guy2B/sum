export function createLiveDataStore(){
  const messages=new Map();
  const signals=new Map();
  const listeners=new Set();
  let status={
    lastSyncAt:null,
    lastSuccessAt:null,
    lastError:null,
    syncing:false,
    connectors:{}
  };

  function emit(){
    const snapshot=api.snapshot();
    for(const listener of listeners) listener(snapshot);
  }

  const api={
    upsertMessages(items=[]){
      for(const item of items) messages.set(item.id,structuredClone(item));
      emit();
      return items.length;
    },
    upsertSignals(items=[]){
      for(const item of items) signals.set(item.id,structuredClone(item));
      emit();
      return items.length;
    },
    setStatus(patch={}){
      status={...status,...structuredClone(patch)};
      emit();
      return structuredClone(status);
    },
    getStatus(){return structuredClone(status);},
    messages(){return [...messages.values()].map(item=>structuredClone(item));},
    signals(){return [...signals.values()].map(item=>structuredClone(item));},
    subscribe(listener){
      listeners.add(listener);
      return ()=>listeners.delete(listener);
    },
    snapshot(){
      return {
        status:structuredClone(status),
        messages:[...messages.values()].map(item=>structuredClone(item)),
        signals:[...signals.values()].map(item=>structuredClone(item))
      };
    }
  };

  return api;
}
