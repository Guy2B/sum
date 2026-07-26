export function searchCommands(commands=[],query=''){
  const q=String(query).trim().toLowerCase();
  return commands
    .map(command=>({...command,score:q?[
      command.title,
      ...(command.keywords||[])
    ].join(' ').toLowerCase().includes(q)?1:0:1}))
    .filter(x=>x.score>0)
    .sort((a,b)=>(b.priority||0)-(a.priority||0));
}
