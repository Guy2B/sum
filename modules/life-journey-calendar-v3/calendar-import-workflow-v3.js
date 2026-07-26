(function(g){
  async function importFile(file,meta={}){
    const text=await file.text();return importText(text,{name:file.name,...meta});
  }
  function importText(text,meta={}){
    const calendar=window.SigmaExternalCalendars.upsert({id:meta.id,name:meta.name||'Calendrier importé',provider:meta.provider||'ics',sourceFile:meta.name||null,lastSyncAt:new Date().toISOString()});
    const parsed=window.SigmaICSNormalizerV3.parse(text);
    const events=window.SigmaICSNormalizerV3.normalize(parsed,calendar.find?calendar.id:meta.id);
    const calendarRow=window.SigmaExternalCalendars.list().find(x=>x.id===(meta.id||calendar[calendar.length-1]?.id))||calendar[calendar.length-1];
    const normalized=window.SigmaICSNormalizerV3.normalize(parsed,calendarRow.id);
    window.SigmaExternalEventStoreV3.merge(normalized);
    window.SigmaExternalCalendars.upsert({...calendarRow,eventCount:normalized.length,lastSyncAt:new Date().toISOString()});
    const result={calendar:window.SigmaExternalCalendars.list().find(x=>x.id===calendarRow.id),events:normalized};
    window.dispatchEvent(new CustomEvent('sigma:calendar-import-complete',{detail:result}));
    return result;
  }
  g.SigmaCalendarImportWorkflowV3={importFile,importText};
})(window);
