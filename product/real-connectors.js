import { createConnectorRuntime } from '../modules/connectors/connector-runtime.mjs';
import { installStandardConnectorPack } from '../modules/connector-pack/connector-pack.mjs';
import { syncAllConnectors } from '../modules/connector-pack/sync-orchestrator.mjs';

const runtime = createConnectorRuntime();
const clients = {
  email:{
    name:'Messagerie',provider:'demo-mail',
    async listMessages(){return{messages:[{id:'m1',subject:'Relance facture demain',body:'Merci de régler demain.',from:'client@example.test'}]}}
  },
  calendar:{
    name:'Calendrier',provider:'demo-calendar',
    async listEvents(){return{events:[{id:'c1',title:'Entretien jeudi',start:new Date(Date.now()+48*36e5).toISOString()}]}}
  },
  documents:{
    name:'Documents',provider:'demo-docs',
    async listDocuments(){return{documents:[{id:'d1',name:'Formulaire administratif',extractedText:'Document à compléter cette semaine.'}]}}
  },
  finance:{
    name:'Finance',provider:'demo-bank',
    async listTransactions(){return{transactions:[{id:'f1',merchant:'Assurance',description:'Prélèvement rejeté',amount:-85,currency:'EUR'}]}}
  }
};

const installations = installStandardConnectorPack(runtime, clients);

async function render() {
  const result = await syncAllConnectors({
    runtime,
    connectorIds: runtime.list().map(item=>item.id),
    context:{editions:['personal','freelancer','job-seeker']}
  });
  const signals = result.results.flatMap(item=>Object.values(item.result?.imported?.queue?.groups||{}).flat());

  document.querySelector('#summary').innerHTML = [
    ['Sources', installations.length],['Synchronisées',result.successful],['Échecs',result.failed],['Importés',result.imported]
  ].map(([label,value])=>`<article class="metric"><span>${label}</span><b>${value}</b></article>`).join('');

  document.querySelector('#cards').innerHTML = runtime.list().map(item=>
    `<article class="card"><span class="badge">Connecté</span><h3>${escapeHtml(item.name)}</h3><p class="meta">${escapeHtml(item.id)}</p><p>${item.capabilities.map(escapeHtml).join(' · ')}</p></article>`
  ).join('');

  document.querySelector('#signals').innerHTML = signals.map(signal=>
    `<article class="signal"><strong>${escapeHtml(signal.title)}</strong><p class="meta">${escapeHtml(signal.source)} · ${signal.priority?.score||0}/100</p><p>${escapeHtml(signal.explanation?.summary||'')}</p></article>`
  ).join('');
}
function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
document.querySelector('#sync').onclick=render;
render();
