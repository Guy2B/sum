import {createConnector} from './connector-contract.mjs';

export function createDemoMailConnector({
  id='demo-mail',
  seed=[]
}={}){
  let connected=false;
  let messages=seed.length?seed:[
    {
      id:'demo-1',
      subject:'Action required today',
      snippet:'Please validate the launch checklist before 17:00.',
      from:{name:'Project Lead',address:'lead@example.com'},
      receivedAt:new Date().toISOString(),
      unread:true,
      labels:['inbox']
    },
    {
      id:'demo-2',
      subject:'Weekly summary',
      snippet:'Here is the weekly progress report.',
      from:{name:'Operations',address:'ops@example.com'},
      receivedAt:new Date(Date.now()-86400000).toISOString(),
      unread:false,
      labels:['inbox']
    }
  ];

  return createConnector({
    id,
    name:'Demo Mail',
    type:'mail',
    async connect(){
      connected=true;
      return {connected:true,mode:'demo'};
    },
    async sync(cursor){
      if(!connected) connected=true;
      const start=Number(cursor||0);
      const batch=messages.slice(start);
      return {messages:batch,cursor:messages.length};
    },
    async disconnect(){
      connected=false;
      return {connected:false};
    },
    async health(){
      return {ok:true,connected};
    }
  });
}
