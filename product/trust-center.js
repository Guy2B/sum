import { createTrustCenter } from '../modules/trust/trust-center.mjs';
import { serializeExport } from '../modules/trust/export-engine.mjs';

const center = createTrustCenter({
  connectors:[
    {id:'email',enabled:true},{id:'calendar',enabled:true},{id:'documents',enabled:true},{id:'finance',enabled:true}
  ],
  retainedItems:[
    {id:'1',source:'email',createdAt:new Date().toISOString()},
    {id:'2',source:'calendar',createdAt:new Date().toISOString()},
    {id:'3',source:'finance',createdAt:new Date().toISOString()},
  ],
  auditEvents:[{id:'a1'}],
  profile:{editions:['personal','freelancer']},
});

center.ledger.grant({subject:'email',capability:'read-signals'});
center.ledger.grant({subject:'calendar',capability:'read-calendar'});
center.ledger.grant({subject:'finance',capability:'read-finance'});

function render(){
  const report=center.report();
  const consents=center.ledger.active();
  document.querySelector('#summary').innerHTML=[
    ['Connecteurs actifs',report.connectors.enabled],
    ['Permissions actives',report.permissions.active],
    ['Permissions sensibles',report.permissions.sensitive],
    ['Éléments conservés',report.storage.retainedItems],
  ].map(([label,value])=>`<article class="metric"><span>${label}</span><b>${value}</b></article>`).join('');

  document.querySelector('#permissions').innerHTML=consents.map(item=>
    `<article class="permission"><div><strong>${escapeHtml(item.subject)}</strong><p>${escapeHtml(item.capability)}</p></div><span class="badge">Accordée</span></article>`
  ).join('');

  document.querySelector('#retention').innerHTML='<strong>90 jours par défaut</strong><p>Les traces d’audit sont préservées. Les autres données peuvent être purgées selon leur source.</p>';
}
function escapeHtml(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
document.querySelector('#refresh').onclick=render;
document.querySelector('#export-data').onclick=()=>{document.querySelector('#output').textContent=serializeExport(center.export());};
document.querySelector('#delete-data').onclick=()=>{document.querySelector('#output').textContent=JSON.stringify(center.deletionPlan({userId:'local-user'}),null,2);};
render();
