export function buildAppViewModel(snapshot={}){
  const messages=snapshot.messages||[];
  const signals=snapshot.signals||[];
  const priorities=signals.filter(item=>['high','critical'].includes(item.priority?.level));
  const unread=messages.filter(item=>item.unread);
  const awaitingReply=signals.filter(item=>item.metadata?.awaitingReply);

  return {
    counters:{
      connected:Object.values(snapshot.status?.connectors||{}).filter(item=>item.status==='connected').length,
      priorities:priorities.length,
      unread:unread.length,
      awaitingReply:awaitingReply.length,
      total:messages.length
    },
    prioritySignals:priorities,
    recentMessages:[...messages].sort((a,b)=>new Date(b.receivedAt)-new Date(a.receivedAt)).slice(0,20),
    sync:{
      syncing:Boolean(snapshot.status?.syncing),
      lastSyncAt:snapshot.status?.lastSyncAt||null,
      lastSuccessAt:snapshot.status?.lastSuccessAt||null,
      lastError:snapshot.status?.lastError||null
    }
  };
}
