(function(g){
  const KEY='sigma:connector-registry:v1';
  const builtins=[
    {id:'google-gmail',group:'google',label:'Gmail',status:'authorization-required',capability:'mail',module:'SigmaGmailClientV1'},
    {id:'google-calendar',group:'google',label:'Google Calendar',status:'authorization-required',capability:'calendar',module:'SigmaGoogleCalendarClientV1'},
    {id:'google-drive',group:'google',label:'Google Drive',status:'authorization-required',capability:'files',module:'SigmaGoogleDriveClientV1'},
    {id:'google-contacts',group:'google',label:'Google Contacts',status:'authorization-required',capability:'contacts',module:'SigmaGoogleContactsClientV1'},
    {id:'google-tasks',group:'google',label:'Google Tasks',status:'authorization-required',capability:'tasks',module:'SigmaGoogleTasksClientV1'}
  ];
  function read(){
    try{
      const current=JSON.parse(localStorage.getItem(KEY)||'[]');
      const map=new Map(builtins.map(x=>[x.id,{...x}]));
      for(const row of current)map.set(row.id,{...(map.get(row.id)||{}),...row});
      return [...map.values()];
    }catch{return builtins.map(x=>({...x}));}
  }
  function write(rows){
    localStorage.setItem(KEY,JSON.stringify(rows));
    window.dispatchEvent(new CustomEvent('sigma:connector-registry-updated',{detail:rows}));
    return rows;
  }
  function upsert(row){
    const rows=read();const i=rows.findIndex(x=>x.id===row.id);
    if(i>=0)rows[i]={...rows[i],...row,updatedAt:new Date().toISOString()};
    else rows.push({...row,updatedAt:new Date().toISOString()});
    return write(rows);
  }
  function setStatus(id,status,extra={}){
    return upsert({id,status,...extra});
  }
  function list(group){const rows=read();return group?rows.filter(x=>x.group===group):rows;}
  function get(id){return read().find(x=>x.id===id)||null;}
  g.SigmaConnectorRegistryV1={KEY,builtins,read,write,upsert,setStatus,list,get};
})(window);
