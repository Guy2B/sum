import fs from 'node:fs';
import path from 'node:path';

const target=process.argv[2];
if(!target) throw new Error('Target required');

const file=path.join(target,'i18n.js');
const backup=file+'.before-release-719';
if(!fs.existsSync(file)) throw new Error('i18n.js not found');

let source=fs.existsSync(backup)?fs.readFileSync(backup,'utf8'):fs.readFileSync(file,'utf8');
const backup735=file+'.before-release-735';
if(!fs.existsSync(backup735)) fs.copyFileSync(file,backup735);

source=source.replace(/\/\*\s*SIGMA-I18N-UNDEFINED-KEY-GUARD-719\s*\*\/[\s\S]*?(?=(?:function|const|let|var)\s+getByPath\b)/m,'');

if(!/\bpath\.split\(/.test(source)) throw new Error('No path.split expression found in i18n.js');
source=source.replace(/\bpath\.split\(/g,'(typeof path === "string" ? path : "").split(');
source='/* SIGMA-I18N-SYNTAX-REPAIR-735 */\n'+source;
fs.writeFileSync(file,source,'utf8');
console.log(JSON.stringify({file,restoredFrom719Backup:fs.existsSync(backup),backup:backup735},null,2));
