export function resolveVariables(value,context={}){
  if(typeof value==='string'){
    return value.replace(/\{\{\s*([^}]+)\s*\}\}/g,(_,path)=>{
      const result=String(path).trim().split('.').reduce((current,key)=>current?.[key],context);
      return result===undefined?'':String(result);
    });
  }
  if(Array.isArray(value)) return value.map(item=>resolveVariables(item,context));
  if(value&&typeof value==='object'){
    return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,resolveVariables(item,context)]));
  }
  return value;
}
