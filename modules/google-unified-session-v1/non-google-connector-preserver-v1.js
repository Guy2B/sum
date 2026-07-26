(function(g){
  function discover(){
    const candidates=[
      ['microsoft','Microsoft','SigmaMicrosoftConnector'],
      ['slack','Slack','SigmaSlackConnector'],
      ['github','GitHub','SigmaGitHubConnector'],
      ['linkedin','LinkedIn','SigmaLinkedInConnector'],
      ['facebook','Facebook','SigmaFacebookConnector']
    ];
    return candidates.map(([id,label,module])=>{
      const installed=Boolean(window[module]);
      window.SigmaConnectorRegistryV1.upsert({id,group:'external',label,module,installed,status:installed?'authorization-required':'unavailable'});
      return{id,label,module,installed};
    });
  }
  g.SigmaNonGoogleConnectorPreserverV1={discover};
})(window);
