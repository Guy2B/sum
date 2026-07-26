(function(g){
  function ensure(){
    if(!window.SigmaGmailAuthSessionV1?.status?.().authenticated)throw new Error('Gmail is not authenticated');
    if(!window.gapi?.client?.gmail)throw new Error('Gmail API client is not initialized');
  }
  async function profile(){
    ensure();
    const r=await window.gapi.client.gmail.users.getProfile({userId:'me'});
    return r.result;
  }
  async function listMessages({q='newer_than:30d',maxResults=50,pageToken}={}){
    ensure();
    const r=await window.gapi.client.gmail.users.messages.list({userId:'me',q,maxResults,pageToken});
    return{messages:r.result.messages||[],nextPageToken:r.result.nextPageToken||null,resultSizeEstimate:r.result.resultSizeEstimate||0};
  }
  async function getMessage(id,format='full'){
    ensure();
    const r=await window.gapi.client.gmail.users.messages.get({userId:'me',id,format});
    return window.SigmaGmailMessageNormalizerV1.normalize(r.result);
  }
  async function listHydrated(options={}){
    const listed=await listMessages(options);
    const messages=await Promise.all(listed.messages.map(x=>getMessage(x.id)));
    return{...listed,messages};
  }
  async function modify(id,{addLabelIds=[],removeLabelIds=[]}={}){
    ensure();
    const r=await window.gapi.client.gmail.users.messages.modify({userId:'me',id,resource:{addLabelIds,removeLabelIds}});
    return r.result;
  }
  async function archive(id){return modify(id,{removeLabelIds:['INBOX']});}
  async function markRead(id){return modify(id,{removeLabelIds:['UNREAD']});}
  async function star(id){return modify(id,{addLabelIds:['STARRED']});}
  function encodeMail({to,subject,body}){
    const raw=`To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${body}`;
    return btoa(unescape(encodeURIComponent(raw))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  async function send(mail){
    ensure();
    const r=await window.gapi.client.gmail.users.messages.send({userId:'me',resource:{raw:encodeMail(mail)}});
    return r.result;
  }
  g.SigmaGmailClientV1={profile,listMessages,getMessage,listHydrated,modify,archive,markRead,star,encodeMail,send};
})(window);
