export function createCommitmentLedger(){
  const entries=[];

  return {
    commit({id,subjectId,title,dueAt=null}={}){
      if(!id||!subjectId||!title) throw new Error('commitment fields are required');
      const item={
        id,
        subjectId,
        title,
        dueAt,
        status:'active',
        committedAt:new Date().toISOString()
      };
      entries.push(item);
      return structuredClone(item);
    },

    update(id,status){
      const item=entries.find(entry=>entry.id===id);
      if(!item) throw new Error('unknown commitment');
      item.status=status;
      item.updatedAt=new Date().toISOString();
      return structuredClone(item);
    },

    list(filters={}){
      return entries
        .filter(item=>!filters.subjectId||item.subjectId===filters.subjectId)
        .filter(item=>!filters.status||item.status===filters.status)
        .map(item=>structuredClone(item));
    }
  };
}
