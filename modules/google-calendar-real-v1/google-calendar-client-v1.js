(function(g){
  const API='https://www.googleapis.com/calendar/v3';
  function token(){
    if(!window.SigmaGoogleAuthSessionV1?.status?.().authenticated)throw new Error('Google Calendar is not authenticated');
    return window.SigmaGoogleAuthSessionV1.getAccessToken();
  }
  async function request(path,{method='GET',query,body}={}){
    const url=new URL(`${API}${path}`);
    Object.entries(query||{}).forEach(([key,value])=>{
      if(value!==undefined&&value!==null&&value!=='')url.searchParams.set(key,String(value));
    });
    const response=await fetch(url,{
      method,
      headers:{
        Authorization:`Bearer ${token()}`,
        Accept:'application/json',
        ...(body?{'Content-Type':'application/json'}:{})
      },
      body:body?JSON.stringify(body):undefined
    });
    const text=await response.text();
    let data={};
    if(text){
      try{data=JSON.parse(text);}
      catch{data={message:text};}
    }
    if(!response.ok){
      const message=data?.error?.message||data?.message||`Google Calendar API error ${response.status}`;
      const error=new Error(message);
      error.status=response.status;
      error.details=data;
      throw error;
    }
    return data;
  }
  async function listCalendars(){
    const data=await request('/users/me/calendarList',{query:{minAccessRole:'reader',showHidden:false}});
    return(data.items||[]).map(x=>({
      id:x.id,summary:x.summary,primary:Boolean(x.primary),accessRole:x.accessRole,
      backgroundColor:x.backgroundColor,foregroundColor:x.foregroundColor,
      timeZone:x.timeZone,selected:x.selected!==false
    }));
  }
  async function listEvents({calendarId='primary',timeMin=new Date().toISOString(),timeMax,limit=250,pageToken}={}){
    const data=await request(`/calendars/${encodeURIComponent(calendarId)}/events`,{
      query:{timeMin,timeMax,maxResults:limit,singleEvents:true,orderBy:'startTime',showDeleted:false,pageToken}
    });
    return{
      items:(data.items||[]).map(normalize),
      nextPageToken:data.nextPageToken||null,
      nextSyncToken:data.nextSyncToken||null
    };
  }
  function normalize(x){
    return{
      id:x.id,calendarId:x.organizer?.email||null,title:x.summary||'(Sans titre)',
      description:x.description||'',location:x.location||'',
      start:x.start?.dateTime||x.start?.date||null,end:x.end?.dateTime||x.end?.date||null,
      allDay:Boolean(x.start?.date&&!x.start?.dateTime),status:x.status||'confirmed',
      htmlLink:x.htmlLink||'',updatedAt:x.updated||null,etag:x.etag||null,
      attendees:(x.attendees||[]).map(a=>({email:a.email,responseStatus:a.responseStatus,self:Boolean(a.self)})),
      source:'google-calendar'
    };
  }
  async function createEvent(calendarId,event){
    const data=await request(`/calendars/${encodeURIComponent(calendarId)}/events`,{
      method:'POST',query:{sendUpdates:'all'},body:event
    });
    return normalize(data);
  }
  async function updateEvent(calendarId,eventId,event){
    const data=await request(`/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,{
      method:'PATCH',query:{sendUpdates:'all'},body:event
    });
    return normalize(data);
  }
  async function deleteEvent(calendarId,eventId){
    await request(`/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,{
      method:'DELETE',query:{sendUpdates:'all'}
    });
    return{ok:true,calendarId,eventId};
  }
  g.SigmaGoogleCalendarClientV1={listCalendars,listEvents,createEvent,updateEvent,deleteEvent,normalize};
})(window);
