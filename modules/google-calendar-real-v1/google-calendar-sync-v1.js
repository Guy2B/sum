(function(g){
  let running=false,lastError=null;
  async function sync({days=90}={}){
    if(running)throw new Error('Google Calendar sync already running');
    running=true;lastError=null;
    try{
      const calendars=await window.SigmaGoogleCalendarClientV1.listCalendars();
      const start=new Date();start.setDate(start.getDate()-7);
      const end=new Date();end.setDate(end.getDate()+days);
      const results=await Promise.all(calendars.filter(x=>x.selected).map(async cal=>{
        const r=await window.SigmaGoogleCalendarClientV1.listEvents({
          calendarId:cal.id,timeMin:start.toISOString(),timeMax:end.toISOString()
        });
        return r.items.map(event=>({...event,calendarId:cal.id,calendarName:cal.summary}));
      }));
      const events=results.flat().sort((a,b)=>String(a.start).localeCompare(String(b.start)));
      const value=window.SigmaGoogleCalendarStoreV1.replace(calendars,events);
      window.dispatchEvent(new CustomEvent('sigma:google-calendar-synced',{detail:{events:events.length,calendars:calendars.length}}));
      return value;
    }catch(e){lastError=e;throw e;}
    finally{running=false;}
  }
  function status(){
    const cache=window.SigmaGoogleCalendarStoreV1.read();
    return{running,lastError:lastError?String(lastError.message||lastError):null,syncedAt:cache.syncedAt,events:cache.events.length,calendars:cache.calendars.length};
  }
  g.SigmaGoogleCalendarSyncV1={sync,status};
})(window);
