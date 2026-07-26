import { createConnectorRuntime } from '../modules/connectors/connector-runtime.mjs';

const runtime = createConnectorRuntime({ rateLimit: { limit: 20, windowMs: 60_000 } });

const demoConnectors = [
  {
    definition:{id:'demo-email',name:'Messagerie',version:'1.0.0',capabilities:['read-signals'],authType:'oauth2'},
    signals:[
      {source:'email',subject:'Facture à régler demain',body:'Échéance demain.'},
      {source:'email',subject:'Entretien jeudi',body:'Merci de confirmer votre présence.'},
    ]
  },
  {
    definition:{id:'demo-calendar',name:'Calendrier',version:'1.0.0',capabilities:['read-signals','read-calendar'],authType:'oauth2'},
    signals:[
      {source:'calendar',title:'Rendez-vous médical vendredi',body:'Préparer les documents.'}
    ]
  },
  {
    definition:{id:'demo-documents',name:'Documents',version:'1.0.0',capabilities:['read-signals','read-documents'],authType:'local'},
    signals:[
      {source:'document',title:'Avis administratif',body:'Document à compléter cette semaine.'}
    ]
  }
];

for (const item of demoConnectors) {
  runtime.install(item.definition, {
    async fetchSignals({ checkpoint }) {
      return {
        signals: item.signals,
        checkpoint: { cursor: (checkpoint?.cursor || 0) + item.signals.length },
        hasMore: false,
      };
    }
  });
}

let latest = [];

async function syncAll() {
  latest = [];
  const results = [];
  for (const connector of runtime.list()) {
    const result = await runtime.sync(connector.id, { editions:['personal','job-seeker'] });
    results.push({ connector, result });
    const importedSignals = Object.values(result.imported?.queue?.groups || {}).flat();
    latest.push(...importedSignals);
  }
  render(results);
}

function render(results = []) {
  const healthy = results.filter(item => item.result.health.status === 'healthy').length;
  const imported = results.reduce((sum,item)=>sum+(item.result.imported?.imported||0),0);
  document.querySelector('#summary').innerHTML = [
    ['Connecteurs', runtime.list().length],
    ['Sains', healthy],
    ['Signaux importés', imported],
    ['En attente', results.filter(item=>item.result.status!=='success').length]
  ].map(([label,value])=>`<article class="metric"><span>${label}</span><b>${value}</b></article>`).join('');

  document.querySelector('#connectors').innerHTML = runtime.list().map(connector => {
    const entry = results.find(item=>item.connector.id===connector.id);
    const status = entry?.result?.health?.status || 'non synchronisé';
    return `<article class="card ${status==='healthy'?'':`status-${status}`}">
      <span class="badge">${escapeHtml(status)}</span>
      <h3>${escapeHtml(connector.name)}</h3>
      <p class="meta">${escapeHtml(connector.id)} · ${escapeHtml(connector.authType)}</p>
      <p>${connector.capabilities.map(escapeHtml).join(' · ')}</p>
    </article>`;
  }).join('');

  document.querySelector('#signals').innerHTML = latest.map(signal =>
    `<article class="signal"><strong>${escapeHtml(signal.title)}</strong>
      <p class="meta">${escapeHtml(signal.source)} · ${signal.priority?.score || 0}/100</p>
      <p>${escapeHtml(signal.explanation?.summary || '')}</p></article>`
  ).join('') || '<p>Aucun signal synchronisé.</p>';
}

function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
document.querySelector('#sync-all').onclick = syncAll;
syncAll();
