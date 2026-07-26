(function(g){
  const FLAG='sigma:connector-migration:v1';
  function migrate(){
    if(localStorage.getItem(FLAG)==='done')return{migrated:false,reason:'already-done'};
    const inventory=window.SigmaConnectorInventoryV1.scan();
    const migrated=[];
    for(const key of inventory.legacyKeys){
      let value=null;
      try{value=JSON.parse(localStorage.getItem(key)||'null');}catch{value=localStorage.getItem(key);}
      const text=`${key} ${JSON.stringify(value)}`.toLowerCase();
      for(const id of ['google-gmail','google-calendar','google-drive','google-contacts','google-tasks']){
        const token=id.split('-')[1];
        if(text.includes(token)){
          window.SigmaConnectorRegistryV1.upsert({id,legacyDetected:true,legacyKey:key});
          migrated.push({id,key});
        }
      }
    }
    localStorage.setItem(FLAG,'done');
    return{migrated:true,migrated};
  }
  g.SigmaLegacyConnectorMigrationV1={FLAG,migrate};
})(window);
