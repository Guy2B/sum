(function(g){
  function parseICS(text){
    const events=[];let current=null;
    for(const raw of String(text||'').split(/\r?\n/)){
      const line=raw.trim();
      if(line==='BEGIN:VEVENT')current={};
      else if(line==='END:VEVENT'&&current){events.push(current);current=null;}
      else if(current){
        const idx=line.indexOf(':');if(idx<0)continue;
        const key=line.slice(0,idx).split(';')[0];const value=line.slice(idx+1);
        if(key==='SUMMARY')current.title=value;
        if(key==='DTSTART')current.start=value;
        if(key==='DTEND')current.end=value;
        if(key==='LOCATION')current.location=value;
        if(key==='DESCRIPTION')current.description=value.replace(/\\n/g,'\n');
        if(key==='UID')current.uid=value;
      }
    }
    return events;
  }
  function normalize(events,source='ics'){return events.map((e,i)=>({id:e.uid||`${source}:${i}:${e.start}`,title:e.title||'Événement importé',start:e.start,end:e.end||null,location:e.location||'',description:e.description||'',source,imported:true}));}
  function importICS(text){const events=normalize(parseICS(text));window.dispatchEvent(new CustomEvent('sigma:calendar-imported',{detail:{source:'ics',events}}));return events;}
  function createProviderLink(provider){
    if(provider==='google')return 'https://calendar.google.com/calendar/u/0/r/settings/export';
    if(provider==='outlook')return 'https://outlook.live.com/calendar/0/options/calendar/SharedCalendars';
    return null;
  }
  g.SigmaCalendarImport={parseICS,normalize,importICS,createProviderLink};
})(window);
