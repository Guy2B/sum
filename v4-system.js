'use strict';
(() => {
  const groups = [
    { label: 'Essentiel', open: true, panels: ['dashboard','attention','plan','coach'] },
    { label: 'Communication', open: true, panels: ['mail','social','context'] },
    { label: 'Organisation', open: true, panels: ['tasks','planner','journal','learning'] },
    { label: 'Business', open: false, panels: ['projects','finance'] },
    { label: 'Bien-être', open: false, panels: ['health'] },
    { label: 'Réglages', open: false, panels: ['connections','sync','account','admin'] }
  ];
  const providerCopy = {
    google: ['Google', 'Gmail, Agenda, Drive et YouTube avec le consentement officiel Google.'],
    microsoft: ['Microsoft', 'Outlook et Microsoft 365. Configuration Entra ID requise.'],
    yahoo: ['Yahoo', 'Connexion sécurisée via mot de passe d’application et connecteur.'],
    apple: ['Apple / iCloud', 'Connexion IMAP avec mot de passe spécifique à l’application.'],
    proton: ['Proton', 'Nécessite Proton Mail Bridge ou un connecteur compatible.'],
    imap: ['Autre fournisseur', 'GMX, OVH, Infomaniak, IONOS, Zoho et serveurs IMAP standards.']
  };

  function groupNavigation() {
    const nav = document.querySelector('.side-nav');
    if (!nav || nav.dataset.v4Ready) return;
    nav.dataset.v4Ready = 'true';
    const search = document.createElement('button');
    search.className = 'v4-search-trigger';
    search.type = 'button';
    search.innerHTML = '<span>⌕</span><strong>Rechercher</strong><span>Ctrl K</span>';
    search.addEventListener('click', openCommand);
    nav.before(search);
    groups.forEach(group => {
      const items = group.panels.map(panel => nav.querySelector(`.nav-item[data-panel="${panel}"]`)).filter(Boolean);
      if (!items.length) return;
      const details = document.createElement('details');
      details.className = 'v4-nav-group';
      details.open = group.open || items.some(item => item.classList.contains('active'));
      const summary = document.createElement('summary');
      summary.textContent = group.label;
      const box = document.createElement('div');
      box.className = 'v4-nav-items';
      items.forEach(item => box.appendChild(item));
      details.append(summary, box);
      nav.appendChild(details);
    });
  }

  function enhanceProviders() {
    const hub = document.getElementById('mail-provider-hub');
    const grid = document.getElementById('mail-provider-grid');
    if (!hub || !grid || hub.querySelector('.v4-provider-control')) return;
    const control = document.createElement('div');
    control.className = 'v4-provider-control';
    const select = document.createElement('select');
    select.className = 'v4-provider-select';
    select.setAttribute('aria-label', 'Choisir un fournisseur');
    Object.entries(providerCopy).forEach(([value, copy]) => {
      const option = document.createElement('option'); option.value = value; option.textContent = copy[0]; select.appendChild(option);
    });
    const button = document.createElement('button');
    button.className = 'button primary'; button.type = 'button'; button.textContent = 'Continuer';
    const help = document.createElement('div'); help.className = 'v4-provider-help';
    const updateHelp = () => { const [name, text] = providerCopy[select.value]; help.innerHTML = `<span aria-hidden="true">●</span><span><b>${name}</b><br>${text}</span>`; };
    select.addEventListener('change', updateHelp);
    button.addEventListener('click', () => grid.querySelector(`[data-mail-provider="${select.value}"]`)?.click());
    control.append(select, button); grid.before(control); control.after(help); updateHelp();
    const add = document.getElementById('mail-add-account');
    add?.addEventListener('click', event => { event.preventDefault(); document.getElementById('panel-mail')?.scrollIntoView({behavior:'smooth'}); select.focus(); });
  }

  function createCommandPalette() {
    if (document.querySelector('.v4-command')) return;
    const backdrop = document.createElement('div'); backdrop.className = 'v4-command-backdrop'; backdrop.hidden = true;
    const box = document.createElement('section'); box.className = 'v4-command'; box.hidden = true; box.setAttribute('role','dialog'); box.setAttribute('aria-label','Recherche rapide');
    box.innerHTML = '<input type="search" placeholder="Aller vers une section…" aria-label="Rechercher une section"><div class="v4-command-list"></div>';
    document.body.append(backdrop, box); backdrop.addEventListener('click', closeCommand);
    const input = box.querySelector('input'); input.addEventListener('input', renderCommands); input.addEventListener('keydown', e => { if (e.key === 'Escape') closeCommand(); if (e.key === 'Enter') box.querySelector('.v4-command-list button')?.click(); });
  }
  function renderCommands() {
    const box = document.querySelector('.v4-command'); if (!box) return;
    const q = box.querySelector('input').value.trim().toLowerCase(); const list = box.querySelector('.v4-command-list'); list.textContent = '';
    document.querySelectorAll('.side-nav .nav-item[data-panel]').forEach((source, index) => {
      const label = source.innerText.replace(/\d+/g,'').trim(); if (q && !label.toLowerCase().includes(q)) return;
      const button = document.createElement('button'); button.type='button'; button.innerHTML=`<span>${label}</span>${index < 9 ? `<span class="v4-command-kbd">${index+1}</span>`:''}`;
      button.addEventListener('click', () => { source.click(); closeCommand(); }); list.appendChild(button);
    });
  }
  function openCommand() { createCommandPalette(); const backdrop=document.querySelector('.v4-command-backdrop'); const box=document.querySelector('.v4-command'); backdrop.hidden=false; box.hidden=false; box.querySelector('input').value=''; renderCommands(); requestAnimationFrame(()=>box.querySelector('input').focus()); }
  function closeCommand() { const backdrop=document.querySelector('.v4-command-backdrop'); const box=document.querySelector('.v4-command'); if(backdrop)backdrop.hidden=true;if(box)box.hidden=true; }
  function keyboard() { document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k') { e.preventDefault(); openCommand(); } if (e.key==='Escape') closeCommand(); }); }
  function updateMeta() { document.title='Σ Life OS V4.5 — Unified Experience'; document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#f5f7fb'); }
  document.addEventListener('DOMContentLoaded', () => { updateMeta(); groupNavigation(); enhanceProviders(); createCommandPalette(); keyboard(); document.documentElement.dataset.sigmaVersion='4.5'; });
})();
