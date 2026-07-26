import fs from 'node:fs';
import path from 'node:path';

const target=process.argv[2];
if(!target) throw new Error('Target required');

const firebaseJson=path.join(target,'firebase.json');
if(!fs.existsSync(firebaseJson)) throw new Error('firebase.json not found');
const cfg=JSON.parse(fs.readFileSync(firebaseJson,'utf8'));

let rulesRel=null;
if(typeof cfg.firestore?.rules==='string') rulesRel=cfg.firestore.rules;
else if(Array.isArray(cfg.firestore)){
  const item=cfg.firestore.find(x=>typeof x?.rules==='string');
  rulesRel=item?.rules||null;
}
if(!rulesRel) throw new Error('Firestore rules path not declared in firebase.json');

const file=path.resolve(target,rulesRel);
if(!fs.existsSync(file)) throw new Error(`Rules file not found: ${file}`);
const old719=file+'.before-release-719';
const backup735=file+'.before-release-735';
if(!fs.existsSync(backup735)) fs.copyFileSync(file,backup735);

let source=fs.existsSync(old719)?fs.readFileSync(old719,'utf8'):fs.readFileSync(file,'utf8');

function findBlock(text, pattern){
  const match=pattern.exec(text);
  if(!match) return null;
  const open=text.indexOf('{',match.index+match[0].length);
  if(open<0) return null;
  let depth=0;
  for(let i=open;i<text.length;i++){
    if(text[i]==='{') depth++;
    else if(text[i]==='}'){
      depth--;
      if(depth===0) return {open,close:i};
    }
  }
  return null;
}

const documents=findBlock(source,/match\s+\/databases\/\{database\}\/documents\s*/m);
if(!documents) throw new Error('Could not locate Firestore documents block');

const block=`
    // SIGMA-USER-OWNERSHIP-RULES-735
    match /users/{uid} {
      allow read, create, update, delete: if request.auth != null && request.auth.uid == uid;

      match /{document=**} {
        allow read, create, update, delete: if request.auth != null && request.auth.uid == uid;
      }
    }
`;

source=source.slice(0,documents.close)+block+source.slice(documents.close);
fs.writeFileSync(file,source,'utf8');
console.log(JSON.stringify({file,restoredFrom719Backup:fs.existsSync(old719),backup:backup735},null,2));
