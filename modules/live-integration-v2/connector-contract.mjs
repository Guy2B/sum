export function createConnector({
  id,
  name,
  type,
  connect,
  sync,
  disconnect=null,
  health=null
}={}){
  if(!id||!name||!type||typeof connect!=='function'||typeof sync!=='function'){
    throw new Error('connector id, name, type, connect and sync are required');
  }
  return {id,name,type,connect,sync,disconnect,health};
}
