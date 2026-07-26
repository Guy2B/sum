import fs from 'node:fs';
import path from 'node:path';

const target=process.argv[2];
if(!target)throw new Error('Target path required');

function allFiles(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(['.git','node_modules','.firebase','dist-backup'].includes(entry.name))continue;
    const p=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...allFiles(p));
    else out.push(p);
  }
  return out;
}
function backup(file,suffix){
  const dst=`${file}.${suffix}`;
  if(!fs.existsSync(dst))fs.copyFileSync(file,dst);
  return dst;
}
function findBest(name){
  const candidates=allFiles(target).filter(p=>path.basename(p).toLowerCase()===name.toLowerCase());
  candidates.sort((a,b)=>{
    const score=p=>(p.includes(`${path.sep}public${path.sep}`)?5:0)+(p.includes(`${path.sep}src${path.sep}`)?3:0)-(p.includes(`${path.sep}tests${path.sep}`)?8:0);
    return score(b)-score(a);
  });
  return candidates[0]||null;
}

function patchI18n(file){
  let src=fs.readFileSync(file,'utf8');
  if(src.includes('SIGMA-I18N-UNDEFINED-KEY-GUARD-719'))return {file,changed:false,already:true};
  backup(file,'before-release-719');

  const marker='/* SIGMA-I18N-UNDEFINED-KEY-GUARD-719 */';
  const safeFn=`${marker}
function __sigmaSafeGetByPath719(object, path) {
  if (!object || typeof path !== "string" || !path.trim()) return undefined;
  return path.split(".").reduce((value, segment) => {
    if (value === null || value === undefined) return undefined;
    return value[segment];
  }, object);
}
`;

  let changed=false;

  // Replace common getByPath function declarations.
  const patterns=[
    /function\s+getByPath\s*\(\s*([^,]+)\s*,\s*([^)]+)\)\s*\{[\s\S]*?\n\}/m,
    /const\s+getByPath\s*=\s*\(\s*([^,]+)\s*,\s*([^)]+)\)\s*=>\s*\{[\s\S]*?\n\};?/m
  ];
  for(const rx of patterns){
    const m=src.match(rx);
    if(m){
      const replacement=`function getByPath(${m[1].trim()}, ${m[2].trim()}) {
  return __sigmaSafeGetByPath719(${m[1].trim()}, ${m[2].trim()});
}`;
      src=src.replace(rx,replacement);
      changed=true;
      break;
    }
  }

  // If getByPath is an arrow expression on one line.
  if(!changed){
    const rx=/const\s+getByPath\s*=\s*\(\s*([^,]+)\s*,\s*([^)]+)\)\s*=>\s*([^;]+);?/m;
    const m=src.match(rx);
    if(m){
      src=src.replace(rx,`const getByPath = (${m[1].trim()}, ${m[2].trim()}) => __sigmaSafeGetByPath719(${m[1].trim()}, ${m[2].trim()});`);
      changed=true;
    }
  }

  if(!changed){
    // Last-resort guard: replace direct path.split occurrences in this module.
    const before=src;
    src=src.replace(/\bpath\.split\(\s*(['"]\.)\s*\)/g,'(typeof path === "string" ? path : "").split($1)');
    changed=src!==before;
  }

  src=safeFn+'\n'+src;
  fs.writeFileSync(file,src,'utf8');
  return {file,changed:true,method:changed?'getByPath-patched':'guard-prepended'};
}

function patchHealth(file){
  if(!file)return {file:null,changed:false,reason:'not-found'};
  let src=fs.readFileSync(file,'utf8');
  if(src.includes('SIGMA-HEALTH-I18N-FALLBACK-719'))return {file,changed:false,already:true};
  backup(file,'before-release-719');

  const marker='/* SIGMA-HEALTH-I18N-FALLBACK-719 */';
  // Wrap direct translator calls whose argument may be undefined.
  const before=src;
  src=src.replace(/(\b(?:i18n|I18n|window\.i18n)\.t)\(\s*([A-Za-z_$][\w$]*(?:\?\.)?(?:\.[A-Za-z_$][\w$]*)*)\s*\)/g,
    '$1($2, $2 || "Indicateur")');
  src=marker+'\n'+src;
  fs.writeFileSync(file,src,'utf8');
  return {file,changed:src!==before};
}

function patchFirebaseCloud(file){
  if(!file)return {file:null,changed:false,reason:'not-found'};
  let src=fs.readFileSync(file,'utf8');
  if(src.includes('SIGMA-FIREBASE-PERMISSION-GUARD-719'))return {file,changed:false,already:true};
  backup(file,'before-release-719');

  // Add a reusable safe wrapper without attempting destructive rewrites.
  const guard=`/* SIGMA-FIREBASE-PERMISSION-GUARD-719 */
function __sigmaFirebasePermissionGuard719(error, context) {
  const code = error?.code || "";
  const message = String(error?.message || error || "");
  if (code === "permission-denied" || /missing or insufficient permissions/i.test(message)) {
    window.SigmaRuntimeFirestoreHotfixV1?.recordPermissionError?.(error, context || "firebase-cloud");
    console.error("[Sigma] Firestore permission denied:", context || "firebase-cloud", error);
    return true;
  }
  return false;
}
`;
  src=guard+'\n'+src;
  fs.writeFileSync(file,src,'utf8');
  return {file,changed:true};
}

function patchApp(){
  const app=findBest('app.html')||path.join(target,'app.html');
  if(!fs.existsSync(app))throw new Error('app.html not found');
  let html=fs.readFileSync(app,'utf8');
  backup(app,'before-release-719');
  if(!html.includes('SIGMA-RUNTIME-FIRESTORE-HOTFIX-V1')){
    html=html.replace('</head>','  <!-- SIGMA-RUNTIME-FIRESTORE-HOTFIX-V1 -->\n  <meta name="sigma-release" content="719">\n</head>');
    html=html.replace('</body>','  <script src="product/runtime-firestore-hotfix-v1-loader.js?v=719"></script>\n  <!-- /SIGMA-RUNTIME-FIRESTORE-HOTFIX-V1 -->\n</body>');
  }else{
    html=html.replace(/<meta name="sigma-release" content="\d+">/,'<meta name="sigma-release" content="719">');
  }
  fs.writeFileSync(app,html,'utf8');
  return app;
}

const i18n=findBest('i18n.js');
if(!i18n)throw new Error('i18n.js not found');
const health=findBest('health.js');
const cloud=findBest('firebase-cloud.js');

const report={
  release:719,
  target,
  i18n:patchI18n(i18n),
  health:patchHealth(health),
  firebaseCloud:patchFirebaseCloud(cloud),
  app:patchApp(),
  generatedAt:new Date().toISOString()
};
fs.writeFileSync(path.join(target,'SIGMA-HOTFIX-719-PATCH-REPORT.json'),JSON.stringify(report,null,2),'utf8');
console.log(JSON.stringify(report,null,2));
