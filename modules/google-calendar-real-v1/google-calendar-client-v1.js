(function(g){
  function ensure(){
    if(!window.SigmaGoogleAuthSessionV1?.status?.().authenticated)throw new Error('Google Calendar is not authenticated');
    if(!window.gapi?.client?.calendar)throw new Error('Google Calendar API client is not initialized');
  }
  async function listCalendars(){
    ensure();
    const response=await window.gapi.client.calendar.calendarList.list({minAccessRole:'reader',showHidden:false});
    return(response.result.items||[]).map(x=>({
      id:x.id,summary:x.summary,primary:Boolean(x.primary),accessRole:x.accessRole,
      backgroundColor:x.backgroundColor,foregroundColor:x.foregroundColor,
      timeZone:x.timeZone,selected:x.selected!==false
    }));
  }
  async function listEvents({calendarId='primary',timeMin=new Date().toISOString(),timeMax,limit=250,pageToken}={}){
    ensure();
    const response=await window.gapi.client.calendar.events.list({
      calendarId,timeMin,timeMax,maxResults:limit,singleEvents:true,orderBy:'startTime',
      showDeleted:false,pageToken
    });
    return{
      items:(response.result.items||[]).map(normalize),
      nextPageToken:response.result.nextPageToken||null,
      nextSyncToken:response.result.nextSyncToken||null
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
    ensure();
    const response=await window.gapi.client.calendar.events.insert({calendarId,resource:event,sendUpdates:'all'});
    return normalize(response.result);
  }
  async function updateEvent(calendarId,eventId,event){
    ensure();
    const response=await window.gapi.client.calendar.events.patch({calendarId,eventId,resource:event,sendUpdates:'all'});
    return normalize(response.result);
  }
  async function deleteEvent(calendarId,eventId){
    ensure();
    await window.gapi.client.calendar.events.delete({calendarId,eventId,sendUpdates:'all'});
    return{ok:true,calendarId,eventId};
  }
  g.SigmaGoogleCalendarClientV1={listCalendars,listEvents,createEvent,updateEvent,deleteEvent,normalize};
})(window);
