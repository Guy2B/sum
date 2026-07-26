(function(g){
  function unfold(text){return String(text||'').replace(/\r?\n[ \t]/g,'');}
  function decode(value){return String(value||'').replace(/\\n/g,'\n').replace(/\\,/g,',').replace(/\\;/g,';').replace(/\\\\/g,'\\');}
  function parseDate(value){
    if(!value)return null;
    if(/^\d{8}$/.test(value))return `${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}`;
    const m=value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
    if(!m)return value;
    const iso=`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${value.endsWith('Z')?'Z':''}`;
    return iso;
  }
  function parse(text){
    const events=[];let current=null;
    for(const raw of unfold(text).split(/\r?\n/)){
      const line=raw.trim();
      if(line==='BEGIN:VEVENT')current={};
      else if(line==='END:VEVENT'&&current){events.push(current);current=null;}
      else if(current){
        const idx=line.indexOf(':');if(idx<0)continue;
        const meta=line.slice(0,idx);const key=meta.split(';')[0];const value=line.slice(idx+1);
        if(key==='UID')current.uid=decode(value);
        if(key==='SUMMARY')current.title=decode(value);
        if(key==='DTSTART')current.start=parseDate(value);
        if(key==='DTEND')current.end=parseDate(value);
        if(key==='LOCATION')current.location=decode(value);
        if(key==='DESCRIPTION')current.description=decode(value);
        if(key==='RRULE')current.rrule=value;
      }
    }
    return events;
  }
  function normalize(events,calendarId='ics'){
    return (events||[]).map((e,i)=>({
      id:e.uid||`${calendarId}:${i}:${e.start||''}`,
      externalId:e.uid||null,
      calendarId,
      title:e.title||'Événement importé',
      start:e.start||null,
      end:e.end||null,
      location:e.location||'',
      description:e.description||'',
      recurrence:e.rrule||null,
      imported:true,
      readOnly:true
    }));
  }
  g.SigmaICSNormalizerV3={unfold,decode,parseDate,parse,normalize};
})(window);
