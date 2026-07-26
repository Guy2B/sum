(function(g){
  const scopes={
    'google-gmail':['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.modify','https://www.googleapis.com/auth/gmail.send'],
    'google-calendar':['https://www.googleapis.com/auth/calendar'],
    'google-drive':['https://www.googleapis.com/auth/drive.file','https://www.googleapis.com/auth/drive.metadata.readonly'],
    'google-contacts':['https://www.googleapis.com/auth/contacts.readonly'],
    'google-tasks':['https://www.googleapis.com/auth/tasks']
  };
  function forConnectors(ids=[]){return [...new Set(ids.flatMap(id=>scopes[id]||[]))];}
  function all(){return [...new Set(Object.values(scopes).flat())];}
  g.SigmaGoogleScopeCatalogV1={scopes,forConnectors,all};
})(window);
