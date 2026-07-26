export function createIncrementalSync({cursor=null,pageSize=100}={}){
  let currentCursor=cursor;
  return {
    request(){return {cursor:currentCursor,pageSize};},
    checkpoint(nextCursor){currentCursor=nextCursor;return currentCursor;},
    state(){return {cursor:currentCursor,pageSize};}
  };
}
