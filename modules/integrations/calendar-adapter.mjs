export function createCalendarAdapter(client){
  return {
    async listSignals({timeMin,timeMax,cursor=null}={}){
      return client.listEvents({timeMin,timeMax,cursor});
    },
    normalize(event){
      return {
        externalId:event.id,
        type:'calendar-event',
        title:event.summary||'(sans titre)',
        startsAt:event.start||null,
        endsAt:event.end||null,
        raw:structuredClone(event)
      };
    }
  };
}
