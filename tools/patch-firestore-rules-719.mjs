import fs from 'node:fs';
import path from 'node:path';

const target=process.argv[2];
if(!target)throw new Error('Target required');
const firebaseJson=path.join(target,'firebase.json');
if(!fs.existsSync(firebaseJson))throw new Error('firebase.json not found');

const config=JSON.parse(fs.readFileSync(firebaseJson,'utf8'));
let rulesRel=null;
if(typeof config.firestore?.rules==='string')rulesRel=config.firestore.rules;
else if(Array.isArray(config.firestore)){
  const first=config.firestore.find(x=>typeof x.rules==='string');
  rulesRel=first?.rules||null;
}
if(!rulesRel)throw new Error('firebase.json does not declare firestore.rules');

const rulesPath=path.resolve(target,rulesRel);
if(!fs.existsSync(rulesPath))throw new Error(`Firestore rules file not found: ${rulesPath}`);

let src=fs.readFileSync(rulesPath,'utf8');
const backup=`${rulesPath}.before-release-719`;
if(!fs.existsSync(backup))fs.copyFileSync(rulesPath,backup);

if(src.includes('SIGMA-USER-OWNERSHIP-RULES-719')){
  console.log(JSON.stringify({changed:false,rulesPath,already:true},null,2));
  process.exit(0);
}

const block=`
    // SIGMA-USER-OWNERSHIP-RULES-719
    match /users/{uid} {
      allow read, create, update, delete: if request.auth != null && request.auth.uid == uid;

      match /{document=**} {
        allow read, create, update, delete: if request.auth != null && request.auth.uid == uid;
      }
    }
`;

function serviceClosingIndex(text){
  const service=text.indexOf('service cloud.firestore');
  if(service<0)return-1;
  const open=text.indexOf('{',service);
  if(open<0)return-1;
  let depth=0,inString=false,quote='',escaped=false;
  for(let i=open;i<text.length;i++){
    const c=text[i];
    if(inString){
      if(escaped){escaped=false;continue;}
      if(c==='\\'){escaped=true;continue;}
      if(c===quote)inString=false;
      continue;
    }
    if(c==='"'||c==="'"){inString=true;quote=c;continue;}
    if(c==='{')depth++;
    else if(c==='}'){
      depth--;
      if(depth===0)return i;
    }
  }
  return-1;
}

const idx=serviceClosingIndex(src);
if(idx<0)throw new Error('Could not locate the closing brace of service cloud.firestore');
src=src.slice(0,idx)+block+'\n'+src.slice(idx);
fs.writeFileSync(rulesPath,src,'utf8');
console.log(JSON.stringify({changed:true,rulesPath,backup},null,2));
