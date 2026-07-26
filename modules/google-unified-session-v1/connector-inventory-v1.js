(function(g){
  const probes=[
    ['google-gmail','SigmaGmailClientV1'],
    ['google-calendar','SigmaGoogleCalendarClientV1'],
    ['google-drive','SigmaGoogleDriveClientV1'],
    ['google-contacts','SigmaGoogleContactsClientV1'],
    ['google-tasks','SigmaGoogleTasksClientV1']
  ];
  function scan(){
    const out=[];
    for(const [id,module] of probes){
      const installed=Boolean(window[module]);
      window.SigmaConnectorRegistryV1.upsert({id,module,installed,status:installed?'authorization-required':'unavailable'});
      out.push({id,module,installed});
    }
    const legacyKeys=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(/gmail|calendar|drive|contact|task|connector|network|oauth/i.test(key||''))legacyKeys.push(key);
    }
    return{connectors:out,legacyKeys};
  }
  g.SigmaConnectorInventoryV1={scan};
})(window);
