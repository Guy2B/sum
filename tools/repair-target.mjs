import fs from 'node:fs';
import path from 'node:path';
const target=process.argv[2];
if(!target)throw new Error('Target required');
const appPath=path.join(target,'app.html');
let html=fs.readFileSync(appPath,'utf8').replace(/^\uFEFF/,'');
const repairs={"Â£": "£", "Â·": "·", "Ã ": "à", "Ã±": "ñ", "Ã—": "×", "âŒ•": "⌕", "âœŽ": "✎", "âœ“": "✓", "â–¦": "▦", "â—Ž": "◎", "â—‡": "◇", "â‚¬": "€", "â†—": "↗", "â†’": "→", "â€¹": "‹", "â€º": "›", "â™¡": "♡", "ï£¿": "", "ðŸ’¼": "💼"};
const applied=[];
for(const [from,to] of Object.entries(repairs)){
  const count=html.split(from).length-1;
  if(count){html=html.split(from).join(to);applied.push({from,to,count});}
}
html=html
 .replace('0 signals · 0 relations','0 signaux · 0 relations')
 .replace('<span data-i18n="nav.journal">Journal</span>','<span data-i18n="nav.journal">Mon parcours</span>')
 .replace('<span id="nav-label-learning" data-i18n="nav.learning">Learning</span>','<span id="nav-label-learning" data-i18n="nav.learning">Apprentissages</span>')
 .replace('<span class="eyebrow" data-i18n="journal.eyebrow">Reflection</span><h1 data-i18n="journal.title">Journal</h1><p data-i18n="journal.subtitle">Create space to think, decide and grow.</p>',
 '<span class="eyebrow" data-i18n="journal.eyebrow">Votre histoire</span><h1 data-i18n="journal.title">Mon parcours</h1><p data-i18n="journal.subtitle">Gardez les moments, décisions et progrès qui comptent.</p>')
 .replace('<h2 data-i18n="journal.addTitle">Daily entry</h2>',
 '<div class="journey-welcome"><span class="journey-spark">✦</span><div><h2 data-i18n="journal.addTitle">Qu’aimeriez-vous retenir d’aujourd’hui ?</h2><p>Une pensée, une réussite, une difficulté ou un moment important.</p></div></div>')
 .replace('<span data-i18n="journal.prompt">What is on your mind?</span>','<span data-i18n="journal.prompt">Ce que je veux retenir</span>')
 .replace('<span data-i18n="journal.gratitude">Gratitude</span>','<span data-i18n="journal.gratitude">Un point positif ou une gratitude</span>')
 .replace('<span class="eyebrow" data-i18n="learning.eyebrow">Growth</span><h1 data-i18n="learning.title">Learning</h1><p data-i18n="learning.subtitle">Make skill progress visible.</p>',
 '<span class="eyebrow" data-i18n="learning.eyebrow">Progresser avec intention</span><h1 data-i18n="learning.title">Mes apprentissages</h1><p data-i18n="learning.subtitle">Transformez vos lectures, cours et expériences en progrès visibles.</p>');
const marker='<!-- SIGMA-UTF8-EXPERIENCE-POLISH-V2 -->';
if(!html.includes(marker)){
 html=html.replace('</head>',`  ${marker}\n  <link rel="stylesheet" href="product/utf8-experience-polish-v2.css?v=555569">\n</head>`);
 html=html.replace('</body>',`  <script src="product/utf8-experience-polish-v2.js?v=555569"></script>\n  <!-- /SIGMA-UTF8-EXPERIENCE-POLISH-V2 -->\n</body>`);
}
fs.writeFileSync(appPath,html,'utf8');
fs.writeFileSync(path.join(target,'UTF8-REPAIR-REPORT.json'),JSON.stringify({
 generatedAt:new Date().toISOString(),
 repairedOccurrences:applied.reduce((n,x)=>n+x.count,0),
 repairs:applied
},null,2),'utf8');
console.log(`UTF-8 repair complete: ${applied.reduce((n,x)=>n+x.count,0)} occurrence(s).`);
