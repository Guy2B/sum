export async function fetchDelta(fetchPage,{cursor=null,maxPages=20}={}) {
  const items=[];let next=cursor;let pages=0;
  do{
    const page=await fetchPage(next);
    items.push(...(page.items||[]));
    next=page.nextCursor??null;
    pages++;
  }while(next&&pages<maxPages);
  return {items,nextCursor:next,pages,truncated:Boolean(next)};
}
