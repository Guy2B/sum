export function createAuditLedger(){
  const entries=[];
  return {
    append(entry){
      const previousHash=entries.length?entries[entries.length-1].hash:'GENESIS';
      const payload={
        sequence:entries.length+1,
        timestamp:new Date().toISOString(),
        previousHash,
        ...structuredClone(entry)
      };
      const hash=Buffer.from(JSON.stringify(payload)).toString('base64url');
      const item={...payload,hash};
      entries.push(item);
      return structuredClone(item);
    },
    verify(){
      for(let index=0;index<entries.length;index++){
        const expectedPrevious=index===0?'GENESIS':entries[index-1].hash;
        if(entries[index].previousHash!==expectedPrevious) return {valid:false,index};
      }
      return {valid:true,count:entries.length};
    },
    list(){return entries.map(item=>structuredClone(item));}
  };
}
