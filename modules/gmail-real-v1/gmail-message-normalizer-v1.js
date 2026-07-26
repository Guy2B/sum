(function(g){
  const decode=value=>{
    if(!value)return'';
    const normalized=value.replace(/-/g,'+').replace(/_/g,'/');
    try{return decodeURIComponent(escape(atob(normalized)));}catch{return'';}
  };
  const header=(headers=[],name)=>headers.find(x=>String(x.name).toLowerCase()===name.toLowerCase())?.value||'';
  function body(payload){
    if(payload?.body?.data)return decode(payload.body.data);
    for(const part of payload?.parts||[]){
      if(part.mimeType==='text/plain'&&part.body?.data)return decode(part.body.data);
    }
    for(const part of payload?.parts||[]){
      const nested=body(part);if(nested)return nested;
    }
    return'';
  }
  function normalize(message){
    const p=message.payload||{},h=p.headers||[];
    return{
      id:message.id,threadId:message.threadId,
      subject:header(h,'Subject')||'(Sans objet)',
      from:header(h,'From'),to:header(h,'To'),cc:header(h,'Cc'),
      date:header(h,'Date')||null,
      snippet:message.snippet||'',body:body(p),
      labelIds:message.labelIds||[],
      unread:(message.labelIds||[]).includes('UNREAD'),
      starred:(message.labelIds||[]).includes('STARRED'),
      hasAttachment:JSON.stringify(p).includes('"attachmentId"'),
      internalDate:message.internalDate?new Date(Number(message.internalDate)).toISOString():null,
      source:'gmail'
    };
  }
  g.SigmaGmailMessageNormalizerV1={decode,header,body,normalize};
})(window);
