'use strict';
(() => {
  const COPY = {
    fr: {
      todayEyebrow: "Votre attention aujourd’hui", todayTitle: 'Trois décisions utiles, pas quinze indicateurs', todayEmpty: 'Ajoutez une tâche ou connectez une source pour recevoir vos premières recommandations.', why: 'Pourquoi ce choix ?', use: 'Agir', plan: 'Planifier', resolved: 'Traité', snooze: 'Demain', useful: 'Utile', notUseful: 'Pas pertinent', confidence: 'Confiance du conseil', sources: 'Sources prises en compte', full: 'Voir le tableau complet', calm: 'Revenir à la vue calme',
      attentionTitle: 'Attention', attentionSub: 'Une seule file pour les messages, échéances, opportunités et signaux de capacité.', all: 'Tous', replies: 'À répondre', opportunities: 'Opportunités', admin: 'Administratif', wellbeing: 'Capacité', noAttention: 'Rien ne réclame votre attention dans ce filtre.', createTask: 'Créer une tâche', markHandled: 'Marquer traité', open: 'Ouvrir',
      planTitle: 'Plan', planSub: 'Un plan réaliste basé sur votre temps, vos échéances et votre énergie.', capacity: 'Capacité du jour', planned: 'Charge planifiée', outcomes: 'Trois résultats à protéger', schedule: 'Ordre recommandé', overload: 'Votre charge dépasse la capacité estimée. Réduisez ou reportez avant de commencer.', balanced: 'La charge reste compatible avec votre capacité estimée.', openTasks: 'Ouvrir les tâches', openCalendar: 'Ouvrir le calendrier', openProjects: 'Ouvrir les projets',
      connectionsTitle: 'Sources et connexions', connectionsSub: 'Σ observe les outils autorisés, sans afficher toutes les plateformes en permanence.', communication: 'Communication', social: 'Réseaux sociaux', organisation: 'Organisation', health: 'Santé et montres', intelligence: 'Intelligence', connected: 'Connecté', demo: 'Démo', notConnected: 'Non connecté', partial: 'Accès partiel', approval: 'Approbation requise', nativeRequired: 'Application mobile requise', configure: 'Configurer', manage: 'Gérer', test: 'Tester', privacy: 'Chaque source peut être coupée et supprimée séparément. Les mots de passe principaux ne sont jamais demandés.',
      adminTitle: 'Console Admin V1.7', adminSub: 'Vérifiez la commercialisation avant d’ouvrir les ventes.', readiness: 'Préparation au lancement', runTests: 'Lancer les contrôles', export: 'Exporter le rapport', scenarioSolo: 'Scénario Solo', scenarioCreator: 'Scénario Creator', scenarioLife: 'Scénario Life', releaseBlocked: 'Publication commerciale bloquée', releaseReady: 'Candidat prêt pour une bêta client contrôlée', adminWarning: 'Le mode Admin QA doit être désactivé avant la mise en production publique.',
      generated: 'Plan actualisé.', taskCreated: 'Tâche créée.', itemHandled: 'Élément traité.', snoozed: 'Rappel créé pour demain.', feedbackSaved: 'Merci, Σ utilisera ce retour pour ajuster le classement.', testPassed: 'OK', testFailed: 'À corriger', browserUnknown: 'Navigateur moderne', localAiCore: 'Moteur Σ universel', localAiOptional: 'IA générative locale facultative', sourceCount: '{count} sources actives', navToday: 'Aujourd’hui', navAttention: 'Attention', navPlan: 'Plan', navSources: 'Sources', navTools: 'Outils', navAdmin: 'Admin QA', refresh: 'Actualiser'
    },
    en: {
      todayEyebrow: 'Your attention today', todayTitle: 'Three useful decisions, not fifteen indicators', todayEmpty: 'Add a task or connect a source to receive your first recommendations.', why: 'Why this choice?', use: 'Act', plan: 'Plan', resolved: 'Handled', snooze: 'Tomorrow', useful: 'Useful', notUseful: 'Not relevant', confidence: 'Advice confidence', sources: 'Sources considered', full: 'View full dashboard', calm: 'Return to calm view',
      attentionTitle: 'Attention', attentionSub: 'One queue for messages, deadlines, opportunities and capacity signals.', all: 'All', replies: 'To reply', opportunities: 'Opportunities', admin: 'Admin', wellbeing: 'Capacity', noAttention: 'Nothing needs attention in this filter.', createTask: 'Create task', markHandled: 'Mark handled', open: 'Open',
      planTitle: 'Plan', planSub: 'A realistic plan based on time, deadlines and energy.', capacity: 'Today capacity', planned: 'Planned load', outcomes: 'Three outcomes to protect', schedule: 'Recommended order', overload: 'Your load exceeds estimated capacity. Reduce or defer before starting.', balanced: 'The load is compatible with estimated capacity.', openTasks: 'Open tasks', openCalendar: 'Open calendar', openProjects: 'Open projects',
      connectionsTitle: 'Sources and connections', connectionsSub: 'Σ observes authorised tools without keeping every platform on screen.', communication: 'Communication', social: 'Social networks', organisation: 'Organisation', health: 'Health and wearables', intelligence: 'Intelligence', connected: 'Connected', demo: 'Demo', notConnected: 'Not connected', partial: 'Partial access', approval: 'Approval required', nativeRequired: 'Mobile app required', configure: 'Configure', manage: 'Manage', test: 'Test', privacy: 'Each source can be disconnected and deleted separately. Main passwords are never requested.',
      adminTitle: 'V1.7 Admin Console', adminSub: 'Verify commercial readiness before opening sales.', readiness: 'Launch readiness', runTests: 'Run checks', export: 'Export report', scenarioSolo: 'Solo scenario', scenarioCreator: 'Creator scenario', scenarioLife: 'Life scenario', releaseBlocked: 'Commercial release blocked', releaseReady: 'Candidate ready for a controlled customer beta', adminWarning: 'Admin QA mode must be disabled before public production.',
      generated: 'Plan updated.', taskCreated: 'Task created.', itemHandled: 'Item handled.', snoozed: 'Reminder created for tomorrow.', feedbackSaved: 'Thank you. Σ will use this feedback to adjust ranking.', testPassed: 'OK', testFailed: 'Fix', browserUnknown: 'Modern browser', localAiCore: 'Universal Σ engine', localAiOptional: 'Optional local generative AI', sourceCount: '{count} active sources', navToday: 'Today', navAttention: 'Attention', navPlan: 'Plan', navSources: 'Sources', navTools: 'Tools', navAdmin: 'Admin QA', refresh: 'Refresh'
    },
    de: {
      todayEyebrow: 'Ihre Aufmerksamkeit heute', todayTitle: 'Drei nützliche Entscheidungen statt fünfzehn Kennzahlen', todayEmpty: 'Fügen Sie eine Aufgabe hinzu oder verbinden Sie eine Quelle.', why: 'Warum diese Wahl?', use: 'Handeln', plan: 'Planen', resolved: 'Erledigt', snooze: 'Morgen', useful: 'Hilfreich', notUseful: 'Nicht relevant', confidence: 'Vertrauen in den Rat', sources: 'Berücksichtigte Quellen', full: 'Vollständiges Dashboard', calm: 'Zur ruhigen Ansicht',
      attentionTitle: 'Aufmerksamkeit', attentionSub: 'Eine Warteschlange für Nachrichten, Fristen, Chancen und Kapazität.', all: 'Alle', replies: 'Antworten', opportunities: 'Chancen', admin: 'Verwaltung', wellbeing: 'Kapazität', noAttention: 'In diesem Filter ist nichts offen.', createTask: 'Aufgabe erstellen', markHandled: 'Erledigt markieren', open: 'Öffnen',
      planTitle: 'Plan', planSub: 'Ein realistischer Plan aus Zeit, Fristen und Energie.', capacity: 'Kapazität heute', planned: 'Geplante Last', outcomes: 'Drei Ergebnisse schützen', schedule: 'Empfohlene Reihenfolge', overload: 'Die Last übersteigt die geschätzte Kapazität.', balanced: 'Die Last passt zur geschätzten Kapazität.', openTasks: 'Aufgaben öffnen', openCalendar: 'Kalender öffnen', openProjects: 'Projekte öffnen',
      connectionsTitle: 'Quellen und Verbindungen', connectionsSub: 'Σ beobachtet erlaubte Werkzeuge, ohne alle Plattformen ständig anzuzeigen.', communication: 'Kommunikation', social: 'Soziale Netzwerke', organisation: 'Organisation', health: 'Gesundheit und Uhren', intelligence: 'Intelligenz', connected: 'Verbunden', demo: 'Demo', notConnected: 'Nicht verbunden', partial: 'Teilzugriff', approval: 'Genehmigung nötig', nativeRequired: 'Mobile App nötig', configure: 'Konfigurieren', manage: 'Verwalten', test: 'Testen', privacy: 'Jede Quelle kann getrennt getrennt und gelöscht werden. Hauptpasswörter werden nie verlangt.',
      adminTitle: 'Admin-Konsole V1.7', adminSub: 'Kommerzielle Bereitschaft vor Verkaufsstart prüfen.', readiness: 'Startbereitschaft', runTests: 'Prüfungen starten', export: 'Bericht exportieren', scenarioSolo: 'Solo-Szenario', scenarioCreator: 'Creator-Szenario', scenarioLife: 'Life-Szenario', releaseBlocked: 'Kommerzielle Freigabe blockiert', releaseReady: 'Kandidat für kontrollierte Kunden-Beta bereit', adminWarning: 'Admin-QA muss vor öffentlicher Produktion deaktiviert werden.',
      generated: 'Plan aktualisiert.', taskCreated: 'Aufgabe erstellt.', itemHandled: 'Element erledigt.', snoozed: 'Erinnerung für morgen erstellt.', feedbackSaved: 'Danke. Σ passt die Rangfolge an.', testPassed: 'OK', testFailed: 'Korrigieren', browserUnknown: 'Moderner Browser', localAiCore: 'Universeller Σ-Motor', localAiOptional: 'Optionale lokale generative KI', sourceCount: '{count} aktive Quellen', navToday: 'Heute', navAttention: 'Aufmerksamkeit', navPlan: 'Plan', navSources: 'Quellen', navTools: 'Werkzeuge', navAdmin: 'Admin QA', refresh: 'Aktualisieren'
    },
    es: {
      todayEyebrow: 'Tu atención hoy', todayTitle: 'Tres decisiones útiles, no quince indicadores', todayEmpty: 'Añade una tarea o conecta una fuente para recibir recomendaciones.', why: '¿Por qué esta elección?', use: 'Actuar', plan: 'Planificar', resolved: 'Tratado', snooze: 'Mañana', useful: 'Útil', notUseful: 'No relevante', confidence: 'Confianza del consejo', sources: 'Fuentes consideradas', full: 'Ver panel completo', calm: 'Volver a la vista tranquila',
      attentionTitle: 'Atención', attentionSub: 'Una sola cola para mensajes, plazos, oportunidades y capacidad.', all: 'Todos', replies: 'Responder', opportunities: 'Oportunidades', admin: 'Administrativo', wellbeing: 'Capacidad', noAttention: 'Nada requiere atención en este filtro.', createTask: 'Crear tarea', markHandled: 'Marcar tratado', open: 'Abrir',
      planTitle: 'Plan', planSub: 'Un plan realista según tiempo, plazos y energía.', capacity: 'Capacidad de hoy', planned: 'Carga planificada', outcomes: 'Tres resultados a proteger', schedule: 'Orden recomendado', overload: 'La carga supera la capacidad estimada. Reduce o aplaza.', balanced: 'La carga es compatible con la capacidad estimada.', openTasks: 'Abrir tareas', openCalendar: 'Abrir calendario', openProjects: 'Abrir proyectos',
      connectionsTitle: 'Fuentes y conexiones', connectionsSub: 'Σ observa herramientas autorizadas sin mantener todas las plataformas en pantalla.', communication: 'Comunicación', social: 'Redes sociales', organisation: 'Organización', health: 'Salud y relojes', intelligence: 'Inteligencia', connected: 'Conectado', demo: 'Demo', notConnected: 'No conectado', partial: 'Acceso parcial', approval: 'Aprobación necesaria', nativeRequired: 'Aplicación móvil necesaria', configure: 'Configurar', manage: 'Gestionar', test: 'Probar', privacy: 'Cada fuente puede desconectarse y eliminarse por separado. Nunca se solicitan las contraseñas principales.',
      adminTitle: 'Consola Admin V1.7', adminSub: 'Verifica la preparación comercial antes de abrir ventas.', readiness: 'Preparación de lanzamiento', runTests: 'Ejecutar controles', export: 'Exportar informe', scenarioSolo: 'Escenario Solo', scenarioCreator: 'Escenario Creator', scenarioLife: 'Escenario Life', releaseBlocked: 'Publicación comercial bloqueada', releaseReady: 'Candidato listo para una beta controlada', adminWarning: 'El modo Admin QA debe desactivarse antes de producción pública.',
      generated: 'Plan actualizado.', taskCreated: 'Tarea creada.', itemHandled: 'Elemento tratado.', snoozed: 'Recordatorio creado para mañana.', feedbackSaved: 'Gracias. Σ ajustará la clasificación.', testPassed: 'OK', testFailed: 'Corregir', browserUnknown: 'Navegador moderno', localAiCore: 'Motor Σ universal', localAiOptional: 'IA generativa local opcional', sourceCount: '{count} fuentes activas', navToday: 'Hoy', navAttention: 'Atención', navPlan: 'Plan', navSources: 'Fuentes', navTools: 'Herramientas', navAdmin: 'Admin QA', refresh: 'Actualizar'
    }
  };

  function initExperienceV17(ctx) {
    const INTEL = window.SUM_INTELLIGENCE_V17;
    if (!INTEL || !document.getElementById('v17-today-recommendations')) return { render() {} };
    const config = window.SUM_CONFIG;
    let attentionFilter = 'all';
    let fullDashboard = false;
    let lastReport = null;
    const copy = () => COPY[ctx.language()] || COPY.en;
    const esc = ctx.escape;
    const tomorrow = () => { const date = new Date(); date.setDate(date.getDate() + 1); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

    function providerLabel(item) {
      const labels = { gmail: 'Gmail', outlook: 'Outlook', yahoo: 'Yahoo', gmx: 'GMX', instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', linkedin: 'LinkedIn', tiktok: 'TikTok', x: 'X', mail: 'Mail', social: 'Social', Calendar: 'Calendar', 'Σ': 'Σ' };
      return labels[item.provider] || item.provider || item.sourceType;
    }
    function sourceIcon(item) {
      const values = { mail: '✉', social: '◎', task: '✓', event: '□', health: '♥' };
      return values[item.sourceType] || '•';
    }
    function actionLabel(item) {
      if (item.sourceType === 'task') return copy().use;
      if (item.needsReply) return copy().createTask;
      if (item.sourceType === 'event') return copy().plan;
      if (item.sourceType === 'health') return copy().plan;
      return copy().use;
    }
    function reasonText(item) {
      const lang = ctx.language();
      const map = {
        fr: { 'reply expected': 'une réponse est attendue', 'high priority': 'le score de priorité est élevé', 'due now': 'l’échéance est immédiate', 'commercial opportunity': 'une opportunité commerciale est détectée', 'reduced capacity': 'votre capacité semble réduite', 'linked to your main goal': 'cela soutient votre objectif principal' },
        en: { 'reply expected': 'a reply is expected', 'high priority': 'the priority score is high', 'due now': 'the deadline is immediate', 'commercial opportunity': 'a commercial opportunity was detected', 'reduced capacity': 'your capacity appears reduced', 'linked to your main goal': 'it supports your main goal' },
        de: { 'reply expected': 'eine Antwort wird erwartet', 'high priority': 'die Priorität ist hoch', 'due now': 'die Frist ist sofort', 'commercial opportunity': 'eine Geschäftschance wurde erkannt', 'reduced capacity': 'Ihre Kapazität ist reduziert', 'linked to your main goal': 'es unterstützt Ihr Hauptziel' },
        es: { 'reply expected': 'se espera una respuesta', 'high priority': 'la prioridad es alta', 'due now': 'el plazo es inmediato', 'commercial opportunity': 'se detectó una oportunidad comercial', 'reduced capacity': 'tu capacidad parece reducida', 'linked to your main goal': 'apoya tu objetivo principal' }
      };
      const dict = map[lang] || map.en;
      return (item.reasons || []).map((reason) => dict[reason] || reason).join(' · ');
    }
    function card(item, index, compact = false) {
      const sources = (item.mergedSources || [item.provider]).map((source) => `<span>${esc(source)}</span>`).join('');
      return `<article class="v17-recommendation ${compact ? 'compact' : ''}" data-attention-id="${esc(item.id)}">
        <div class="v17-recommendation-rank">${compact ? sourceIcon(item) : index + 1}</div>
        <div class="v17-recommendation-main">
          <div class="v17-recommendation-meta"><span>${esc(providerLabel(item))}</span><b>${Math.round(item.score)}</b></div>
          <h3>${esc(item.title)}</h3>${item.sender ? `<p class="v17-sender">${esc(item.sender)}</p>` : ''}<p>${esc(item.body || '')}</p>
          ${compact ? '' : `<details><summary>${copy().why}</summary><p>${esc(reasonText(item) || copy().todayTitle)}</p><div class="v17-source-badges">${sources}</div></details>`}
        </div>
        <div class="v17-recommendation-actions">
          <button class="button primary small" type="button" data-v17-action="act" data-v17-id="${esc(item.id)}">${esc(actionLabel(item))}</button>
          ${item.sourceType !== 'task' && item.sourceType !== 'health' ? `<button class="text-button" type="button" data-v17-action="snooze" data-v17-id="${esc(item.id)}">${copy().snooze}</button>` : ''}
          ${item.sourceType === 'mail' || item.sourceType === 'social' ? `<button class="icon-button" type="button" data-v17-action="resolve" data-v17-id="${esc(item.id)}" title="${copy().markHandled}">✓</button>` : ''}
          ${item.sourceUrl ? `<a class="icon-button" href="${esc(item.sourceUrl)}" target="_blank" rel="noopener" title="${copy().open}">↗</a>` : ''}
        </div>
      </article>`;
    }
    function activeSourceCount(state) {
      let count = (state.mailAccounts || []).length + (state.socialAccounts || []).length + (state.healthSources || []).filter((source) => source.status === 'connected').length;
      if ((state.events || []).length) count += 1;
      if ((state.finance || []).length) count += 1;
      return count;
    }
    function renderToday() {
      const state = ctx.getState();
      const recs = INTEL.recommendations(state);
      const root = document.getElementById('v17-today-recommendations');
      root.innerHTML = recs.length ? recs.map((item, index) => card(item, index)).join('') : `<div class="empty-state">${copy().todayEmpty}</div>`;
      const confidence = INTEL.confidence(state);
      document.getElementById('v17-confidence-value').textContent = `${confidence}%`;
      document.getElementById('v17-confidence-bar').style.width = `${confidence}%`;
      const sources = activeSourceCount(state);
      document.getElementById('v17-source-count').textContent = copy().sourceCount.replace('{count}', sources);
      document.getElementById('v17-full-dashboard-toggle').textContent = fullDashboard ? copy().calm : copy().full;
      document.body.classList.toggle('v17-full-dashboard', fullDashboard);
      const graph = INTEL.graph(state);
      const graphText = document.getElementById('v17-context-graph-summary');
      if (graphText) graphText.textContent = `${graph.nodes.length} signals · ${graph.edges.length} relations`;
    }
    function matchesFilter(item) {
      if (attentionFilter === 'all') return true;
      if (attentionFilter === 'reply') return item.needsReply;
      if (attentionFilter === 'opportunity') return item.category === 'opportunity';
      if (attentionFilter === 'admin') return item.category === 'admin';
      if (attentionFilter === 'wellbeing') return item.category === 'wellbeing';
      return true;
    }
    function renderAttention() {
      const rows = INTEL.attention(ctx.getState()).filter(matchesFilter);
      document.getElementById('v17-attention-list').innerHTML = rows.length ? rows.map((item, index) => card(item, index, true)).join('') : `<div class="empty-state">${copy().noAttention}</div>`;
      const all = INTEL.attention(ctx.getState());
      const counts = { all: all.length, reply: all.filter((item) => item.needsReply).length, opportunity: all.filter((item) => item.category === 'opportunity').length, admin: all.filter((item) => item.category === 'admin').length, wellbeing: all.filter((item) => item.category === 'wellbeing').length };
      Object.entries(counts).forEach(([key, value]) => { const el = document.getElementById(`v17-attention-count-${key}`); if (el) el.textContent = value; });
      const nav = document.getElementById('v17-attention-nav-count');
      if (nav) { nav.textContent = counts.reply + counts.opportunity; nav.hidden = !(counts.reply + counts.opportunity); }
    }
    function renderPlan() {
      const state = ctx.getState();
      const capacity = INTEL.capacity(state);
      const items = INTEL.recommendations(state);
      document.getElementById('v17-capacity-value').textContent = `${Math.round(capacity.adjustedMinutes / 60 * 10) / 10} h`;
      document.getElementById('v17-planned-value').textContent = `${Math.round(capacity.plannedMinutes / 60 * 10) / 10} h`;
      document.getElementById('v17-capacity-bar').style.width = `${Math.min(100, capacity.load)}%`;
      document.getElementById('v17-capacity-bar').dataset.over = capacity.load > 100 ? 'true' : 'false';
      document.getElementById('v17-plan-warning').textContent = capacity.load > 100 ? copy().overload : copy().balanced;
      document.getElementById('v17-plan-outcomes').innerHTML = items.length ? items.slice(0, 3).map((item, index) => `<article><span>${index + 1}</span><div><strong>${esc(item.title)}</strong><small>${esc(providerLabel(item))} · ${Math.round(item.score)}</small></div><button class="icon-button" type="button" data-v17-action="act" data-v17-id="${esc(item.id)}">→</button></article>`).join('') : `<div class="empty-state compact">${copy().todayEmpty}</div>`;
      const tasks = (state.tasks || []).filter((task) => !task.done).sort((a, b) => Number(Boolean(b.urgent)) - Number(Boolean(a.urgent)) || String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999'))).slice(0, 6);
      let minute = 0;
      document.getElementById('v17-plan-schedule').innerHTML = tasks.length ? tasks.map((task) => { const start = minute; minute += Number(task.estimate || 30); return `<article><time>+${start} min</time><div><strong>${esc(task.title)}</strong><small>${Number(task.estimate || 30)} min · ${esc(task.category || '')}</small></div></article>`; }).join('') : `<div class="empty-state compact">${copy().todayEmpty}</div>`;
    }
    function sourceRow({ icon, name, detail, status, state, action, panel }) {
      return `<article class="v17-source-row" data-state="${esc(state)}"><span class="v17-source-icon">${icon}</span><div><strong>${esc(name)}</strong><small>${esc(detail)}</small></div><span class="status-chip ${state === 'connected' ? 'success' : state === 'partial' ? 'warning' : ''}">${esc(status)}</span><button class="button secondary small" type="button" ${panel ? `data-panel="${panel}"` : action === 'calendar' ? 'data-calendar-open' : `data-v17-source="${esc(action || name)}"`}>${state === 'connected' ? copy().manage : copy().configure}</button></article>`;
    }
    function renderConnections() {
      const state = ctx.getState();
      const mail = state.mailAccounts || [];
      const social = state.socialAccounts || [];
      const health = state.healthSources || [];
      const mailRows = ['gmail','outlook','yahoo','gmx'].map((provider) => {
        const account = mail.find((row) => row.provider === provider);
        return sourceRow({ icon: provider === 'gmail' ? 'G' : provider === 'outlook' ? 'O' : provider === 'yahoo' ? 'Y!' : 'GMX', name: ({gmail:'Gmail / Google Workspace',outlook:'Outlook / Microsoft 365',yahoo:'Yahoo Mail',gmx:'GMX'})[provider], detail: account?.email || 'OAuth / mot de passe d’application', status: account ? (account.demo ? copy().demo : copy().connected) : copy().notConnected, state: account ? 'connected' : 'off', panel: 'mail' });
      });
      document.getElementById('v17-connections-mail').innerHTML = mailRows.join('');
      const socialRows = ['instagram','facebook','youtube','x','linkedin','tiktok'].map((provider) => {
        const account = social.find((row) => row.provider === provider);
        const restricted = provider === 'linkedin' || provider === 'tiktok';
        const status = account ? (account.demo ? copy().demo : copy().connected) : restricted ? copy().approval : copy().notConnected;
        return sourceRow({ icon: ({instagram:'IG',facebook:'f',youtube:'▶',x:'X',linkedin:'in',tiktok:'♪'})[provider], name: ({instagram:'Instagram Business',facebook:'Facebook Pages',youtube:'YouTube',x:'X',linkedin:'LinkedIn',tiktok:'TikTok'})[provider], detail: restricted ? copy().partial : 'OAuth officiel', status, state: account ? 'connected' : restricted ? 'partial' : 'off', panel: 'social' });
      });
      document.getElementById('v17-connections-social').innerHTML = socialRows.join('');
      const calendarRows = ['google','microsoft'].map((provider) => {
        const account = (state.calendarAccounts || []).find((row) => row.provider === provider);
        return sourceRow({ icon: provider === 'google' ? 'G' : 'M', name: provider === 'google' ? 'Google Calendar' : 'Outlook / Microsoft 365', detail: account?.email || 'OAuth · lecture seule', status: account ? (account.demo ? copy().demo : copy().connected) : copy().notConnected, state: account ? 'connected' : 'off', action: 'calendar' });
      });
      document.getElementById('v17-connections-calendar').innerHTML = calendarRows.join('');
      const healthRows = [
        { provider: 'apple', icon: '', name: 'Apple Health / Apple Watch', detail: 'HealthKit · iOS', native: true },
        { provider: 'samsung', icon: 'S', name: 'Samsung Health / Galaxy Watch', detail: 'Samsung Health + Health Connect · Android', native: true },
        { provider: 'health-connect', icon: 'H', name: 'Health Connect', detail: 'Android', native: true }
      ].map((item) => { const source = health.find((row) => row.provider === item.provider); return sourceRow({ icon: item.icon, name: item.name, detail: source ? `${item.detail} · ${source.mode || ''}` : item.detail, status: source ? copy().connected : copy().nativeRequired, state: source ? 'connected' : 'partial', panel: 'health' }); });
      document.getElementById('v17-connections-health').innerHTML = healthRows.join('');
      const gateway = Boolean(config.localAiGatewayUrl);
      document.getElementById('v17-connections-ai').innerHTML = [
        sourceRow({ icon: 'Σ', name: copy().localAiCore, detail: 'Règles + Transformers.js · WASM/WebGPU', status: copy().connected, state: 'connected', panel: 'coach' }),
        sourceRow({ icon: 'AI', name: copy().localAiOptional, detail: gateway ? 'Σ Local AI Gateway / Ollama' : 'Chrome/Edge natif ou passerelle locale', status: gateway ? copy().connected : copy().notConnected, state: gateway ? 'connected' : 'off', panel: 'coach' })
      ].join('');

      const googleConfigured = Boolean(window.SigmaGoogle?.configured?.());
      const youtubeConnected = social.some((row) => row.provider === 'youtube' && !row.demo);
      const driveConnected = Boolean(state.googleServices?.drive?.connected);
      const googleTarget = document.getElementById('v46-google-services');
      if (googleTarget) googleTarget.innerHTML = [
        sourceRow({ icon: 'G', name: 'Gmail', detail: 'Lecture et envoi depuis la Messagerie', status: mail.some((row) => row.provider === 'gmail' && !row.demo) ? copy().connected : copy().notConnected, state: mail.some((row) => row.provider === 'gmail' && !row.demo) ? 'connected' : 'off', panel: 'mail' }),
        sourceRow({ icon: 'C', name: 'Google Calendar', detail: 'Lecture et création de rendez-vous', status: (state.calendarAccounts || []).some((row) => row.provider === 'google' && !row.demo) ? copy().connected : copy().notConnected, state: (state.calendarAccounts || []).some((row) => row.provider === 'google' && !row.demo) ? 'connected' : 'off', action: 'google-calendar' }),
        sourceRow({ icon: 'D', name: 'Google Drive', detail: 'Sauvegarde privée dans appDataFolder', status: driveConnected ? copy().connected : (googleConfigured ? 'Disponible' : copy().notConnected), state: driveConnected ? 'connected' : (googleConfigured ? 'partial' : 'off'), action: 'google-drive' }),
        sourceRow({ icon: '▶', name: 'YouTube', detail: 'Import de vos abonnements', status: youtubeConnected ? copy().connected : (googleConfigured ? 'Disponible' : copy().notConnected), state: youtubeConnected ? 'connected' : (googleConfigured ? 'partial' : 'off'), action: 'google-youtube' }),
        sourceRow({ icon: 'M', name: 'Google Maps', detail: 'Ouvrir Maps; intégration Places prévue séparément', status: 'Disponible', state: 'partial', action: 'google-maps' })
      ].join('');
      const browser = document.getElementById('v17-browser-label');
      if (browser) browser.textContent = browserName();
    }
    function browserName() {
      const ua = navigator.userAgent;
      if (/Edg\//.test(ua)) return 'Microsoft Edge';
      if (/Firefox\//.test(ua)) return 'Firefox';
      if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
      if (/Chrome\//.test(ua)) return 'Chrome';
      return copy().browserUnknown;
    }
    function findItem(id) { return INTEL.attention(ctx.getState()).find((item) => item.id === id); }
    function recordFeedback(item, action) {
      ctx.updateState((state) => {
        state.intelligence = state.intelligence || { feedback: [], preferences: {}, lastAnalysis: null };
        state.intelligence.feedback = state.intelligence.feedback || [];
        state.intelligence.feedback.unshift({ id: ctx.uid(), itemId: item?.id || '', category: item?.category || '', provider: item?.provider || '', action, at: new Date().toISOString() });
        state.intelligence.feedback = state.intelligence.feedback.slice(0, 200);
        state.intelligence.lastAnalysis = new Date().toISOString();
      });
    }
    function createTask(item, date = ctx.today()) {
      if (!item) return;
      if (item.sourceType === 'task') { ctx.navigate('tasks'); return; }
      ctx.updateState((state) => state.tasks.unshift({ id: ctx.uid(), title: item.needsReply ? `Répondre : ${item.title}` : item.title, category: item.category === 'admin' ? 'Admin' : item.category === 'opportunity' ? 'Client' : 'Communication', priority: item.score >= 85 ? 'high' : 'medium', important: item.score >= 65, urgent: item.score >= 88, estimate: item.sourceType === 'health' ? 30 : 20, dueDate: date, done: false, createdAt: new Date().toISOString(), source: { type: item.sourceType, id: item.sourceId, provider: item.provider } }));
      recordFeedback(item, date === ctx.today() ? 'acted' : 'snoozed');
      ctx.toast(date === ctx.today() ? copy().taskCreated : copy().snoozed);
    }
    function resolve(item) {
      if (!item) return;
      ctx.updateState((state) => {
        if (item.sourceType === 'mail') { const row = state.mailMessages.find((value) => value.id === item.sourceId); if (row) { row.handled = true; row.needsReply = false; row.unread = false; } }
        if (item.sourceType === 'social') { const row = state.socialInteractions.find((value) => value.id === item.sourceId); if (row) row.handled = true; }
        if (item.sourceType === 'task') { const row = state.tasks.find((value) => value.id === item.sourceId); if (row) row.done = true; }
      });
      recordFeedback(item, 'resolved');
      ctx.toast(copy().itemHandled);
    }
    function seedScenario(profile) {
      const now = new Date(); const iso = (days) => { const date = new Date(now); date.setDate(date.getDate() + days); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
      ctx.updateState((state) => {
        state.settings.profile = profile;
        state.settings.name = profile === 'creator' ? 'Camille' : profile === 'life' ? 'Alex' : 'Michael';
        state.settings.onboardingComplete = true;
        state.contextProfile.primaryGoal = profile === 'creator' ? 'Publier une offre rentable sans épuisement' : profile === 'life' ? 'Retrouver une semaine stable et plus légère' : 'Stabiliser les revenus de la microactivité';
        state.contextProfile.successDefinition = 'Trois résultats utiles, une charge réaliste et aucune demande client oubliée.';
        state.contextProfile.weeklyHours = profile === 'life' ? 12 : 28;
        state.tasks = [
          { id: ctx.uid(), title: profile === 'creator' ? 'Finaliser la page de lancement' : 'Finaliser le devis Martin', category: 'Client', priority: 'high', urgent: true, important: true, essential: true, estimate: 50, dueDate: iso(0), done: false, createdAt: now.toISOString() },
          { id: ctx.uid(), title: 'Préparer la semaine prochaine', category: 'Planification', priority: 'medium', urgent: false, important: true, essential: true, estimate: 30, dueDate: iso(1), done: false, createdAt: now.toISOString() },
          { id: ctx.uid(), title: 'Classer les justificatifs', category: 'Admin', priority: 'low', urgent: false, important: false, estimate: 40, dueDate: iso(4), done: false, createdAt: now.toISOString() }
        ];
        state.calendarAccounts = [{ id: 'demo-calendar', provider: 'google', email: 'agenda@sum.test', label: 'Google Calendar démo', demo: true, status: 'connected' }];
        state.events = [{ id: ctx.uid(), title: 'Rendez-vous client', date: iso(0), time: '16:00', externalProvider: 'google', accountId: 'demo-calendar', createdAt: now.toISOString() }];
        state.mailAccounts = [{ id: 'demo-mail', provider: 'gmail', email: 'demo@sum.test', demo: true, status: 'connected' }];
        state.mailMessages = [
          { id: ctx.uid(), accountId: 'demo-mail', provider: 'gmail', subject: 'Proposition et délai pour vendredi', sender: 'Martin Client', snippet: 'Pouvez-vous confirmer le tarif et le calendrier aujourd’hui ?', receivedAt: new Date(now.getTime() - 22 * 3600000).toISOString(), unread: true, importance: 'high', needsReply: true },
          { id: ctx.uid(), accountId: 'demo-mail', provider: 'gmail', subject: 'Renouvellement assurance', sender: 'Assurance', snippet: 'Un document est nécessaire avant le renouvellement.', receivedAt: new Date(now.getTime() - 30 * 3600000).toISOString(), unread: true, importance: 'normal', needsReply: false }
        ];
        state.socialAccounts = [{ id: 'demo-social', provider: profile === 'creator' ? 'youtube' : 'instagram', label: 'Compte démo', demo: true, status: 'connected' }];
        state.socialInteractions = [{ id: ctx.uid(), accountId: 'demo-social', provider: profile === 'creator' ? 'youtube' : 'instagram', type: 'comment', title: profile === 'creator' ? 'Question sur votre offre' : 'Demande de prix', content: 'Bonjour, pouvez-vous m’envoyer les conditions et le tarif ?', sender: 'Nadia', receivedAt: new Date(now.getTime() - 5 * 3600000).toISOString(), unread: true, requiresReply: true, priority: 88, contentIdea: profile === 'creator', handled: false }];
        state.health = [{ id: ctx.uid(), date: iso(0), source: 'demo', sleep: profile === 'life' ? 6.1 : 6.4, energy: profile === 'life' ? 4 : 5, stress: 7, steps: 4100, hrv: 38 }];
        state.healthSources = [{ provider: 'apple', status: 'connected', mode: 'demo', lastSync: now.toISOString() }];
        state.finance = [{ id: ctx.uid(), type: 'income', amount: 1200, description: 'Acompte client', category: 'Client', date: iso(-3) }, { id: ctx.uid(), type: 'expense', amount: 180, description: 'Logiciels', category: 'Abonnements', date: iso(-2) }];
        state.ownerPreview = true;
      });
      ctx.toast(`${copy().generated} ${profile}`);
    }
    async function testBackend(url, path = '/health') {
      if (!url) return { ok: false, detail: 'URL manquante' };
      try { const response = await fetch(`${String(url).replace(/\/$/, '')}${path}`, { credentials: 'omit' }); return { ok: response.ok, detail: `${response.status}` }; }
      catch (error) { return { ok: false, detail: error.message }; }
    }
    async function runAdminTests() {
      const checks = [];
      const add = (name, ok, detail = '') => checks.push({ name, ok: Boolean(ok), detail });
      add('HTTPS / secure context', globalThis.isSecureContext || location.hostname === 'localhost', location.protocol);
      add('Local storage', (() => { try { localStorage.setItem('__sigma_test','1'); localStorage.removeItem('__sigma_test'); return true; } catch { return false; } })());
      add('Web Crypto', Boolean(globalThis.crypto?.subtle));
      add('WebAssembly', typeof WebAssembly === 'object');
      add('Service Worker', 'serviceWorker' in navigator);
      add('IndexedDB', 'indexedDB' in globalThis);
      add('WebGPU acceleration', Boolean(navigator.gpu), 'Optional');
      add('Checkout monthly', Boolean(config.monthlyCheckoutUrl), config.paymentMode || 'test');
      add('Checkout annual', Boolean(config.annualCheckoutUrl), config.paymentMode || 'test');
      add('Support email', Boolean(config.supportEmail), config.supportEmail || 'missing');
      add('Legal entity', Boolean(config.legalEntity), config.legalEntity || 'missing');
      add('Admin QA disabled for go-live', !config.adminQaEnabled, config.adminQaEnabled ? 'enabled' : 'disabled');
      const mail = await testBackend(config.mailApiBaseUrl);
      add('Mail backend', mail.ok, mail.detail);
      const social = await testBackend(config.socialApiBaseUrl);
      add('Social backend', social.ok, social.detail);
      const calendar = await testBackend(config.calendarApiBaseUrl);
      add('Calendar backend', calendar.ok, calendar.detail);
      const ai = await testBackend(config.localAiGatewayUrl);
      add('Local AI gateway', ai.ok || !config.localAiGatewayUrl, config.localAiGatewayUrl ? ai.detail : 'optional');
      const critical = checks.filter((item) => !item.ok && !['WebGPU acceleration','Local AI gateway'].includes(item.name));
      const score = Math.round(checks.filter((item) => item.ok).length / checks.length * 100);
      lastReport = { generatedAt: new Date().toISOString(), version: config.version, location: location.href, browser: navigator.userAgent, score, releaseReady: critical.length === 0, checks };
      renderAdminReport(lastReport);
      return lastReport;
    }
    function renderAdminReport(report) {
      document.getElementById('v17-admin-score').textContent = `${report.score}%`;
      document.getElementById('v17-admin-score-bar').style.width = `${report.score}%`;
      document.getElementById('v17-admin-status').textContent = report.releaseReady ? copy().releaseReady : copy().releaseBlocked;
      document.getElementById('v17-admin-status').dataset.ready = report.releaseReady ? 'true' : 'false';
      document.getElementById('v17-admin-checks').innerHTML = report.checks.map((item) => `<article class="v17-admin-check ${item.ok ? 'ok' : 'fail'}"><span>${item.ok ? '✓' : '!'}</span><div><strong>${esc(item.name)}</strong><small>${esc(item.detail || '')}</small></div><b>${item.ok ? copy().testPassed : copy().testFailed}</b></article>`).join('');
    }
    function exportReport() {
      if (!lastReport) return runAdminTests().then(exportReport);
      const blob = new Blob([JSON.stringify(lastReport, null, 2)], { type: 'application/json' });
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `sigma-v17-admin-report-${ctx.today()}.json`; link.click(); URL.revokeObjectURL(link.href);
    }
    function updateStaticCopy() {
      const values = {
        'v17-today-eyebrow': copy().todayEyebrow, 'v17-today-title': copy().todayTitle, 'v17-confidence-label': copy().confidence, 'v17-sources-label': copy().sources,
        'v17-attention-title': copy().attentionTitle, 'v17-attention-sub': copy().attentionSub, 'v17-plan-title': copy().planTitle, 'v17-plan-sub': copy().planSub,
        'v17-capacity-label': copy().capacity, 'v17-planned-label': copy().planned, 'v17-outcomes-title': copy().outcomes, 'v17-schedule-title': copy().schedule,
        'v17-connections-title': copy().connectionsTitle, 'v17-connections-sub': copy().connectionsSub, 'v17-connections-privacy': copy().privacy,
        'v17-admin-title': copy().adminTitle, 'v17-admin-sub': copy().adminSub, 'v17-admin-readiness': copy().readiness, 'v17-admin-warning': copy().adminWarning,
        'v17-admin-run': copy().runTests, 'v17-admin-export': copy().export, 'v17-scenario-solo': copy().scenarioSolo, 'v17-scenario-creator': copy().scenarioCreator, 'v17-scenario-life': copy().scenarioLife,
        'v17-open-tasks': copy().openTasks, 'v17-open-calendar': copy().openCalendar, 'v17-open-projects': copy().openProjects,
        'v17-connection-mail-title': copy().communication, 'v17-connection-social-title': copy().social, 'v17-connection-calendar-title': copy().organisation, 'v17-connection-health-title': copy().health, 'v17-connection-ai-title': copy().intelligence,
        'v17-nav-today': copy().navToday, 'v17-nav-attention': copy().navAttention, 'v17-nav-plan': copy().navPlan, 'v17-nav-sources': copy().navSources, 'v17-nav-tools': copy().navTools, 'v17-nav-admin': copy().navAdmin,
        'v17-mobile-today': copy().navToday, 'v17-mobile-attention': copy().navAttention, 'v17-mobile-plan': copy().navPlan,
        'v17-attention-sources-label': copy().navSources, 'v17-plan-today-label': copy().navToday, 'v17-plan-refresh-label': copy().refresh
      };
      Object.entries(values).forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.textContent = value; });
      const tabValues = { all: copy().all, reply: copy().replies, opportunity: copy().opportunities, admin: copy().admin, wellbeing: copy().wellbeing };
      Object.entries(tabValues).forEach(([key, label]) => { const el = document.querySelector(`[data-v17-attention-filter="${key}"] span`); if (el) el.textContent = label; });
    }
    function render() { updateStaticCopy(); renderToday(); renderAttention(); renderPlan(); renderConnections(); }

    document.addEventListener('click', (event) => {
      const filter = event.target.closest('[data-v17-attention-filter]');
      if (filter) { attentionFilter = filter.dataset.v17AttentionFilter; document.querySelectorAll('[data-v17-attention-filter]').forEach((button) => button.classList.toggle('active', button === filter)); renderAttention(); }
      const action = event.target.closest('[data-v17-action]');
      if (action) {
        const item = findItem(action.dataset.v17Id);
        if (action.dataset.v17Action === 'act') createTask(item);
        if (action.dataset.v17Action === 'snooze') createTask(item, tomorrow());
        if (action.dataset.v17Action === 'resolve') resolve(item);
      }
      if (event.target.closest('#v17-full-dashboard-toggle')) { fullDashboard = !fullDashboard; renderToday(); }
      if (event.target.closest('#v17-plan-refresh')) { renderPlan(); ctx.toast(copy().generated); }
      const scenario = event.target.closest('[data-v17-scenario]'); if (scenario) seedScenario(scenario.dataset.v17Scenario);
      if (event.target.closest('#v17-admin-run')) runAdminTests();
      if (event.target.closest('#v17-admin-export')) exportReport();
      const source = event.target.closest('[data-v17-source]');
      if (source) {
        const action = source.dataset.v17Source;
        if (action === 'google-maps') {
          window.open('https://www.google.com/maps', '_blank', 'noopener,noreferrer');
          return;
        }
        if (action === 'google-calendar') {
          ctx.navigate('planner');
          return;
        }
        if (action === 'google-drive') {
          event.preventDefault();
          (async () => {
            try {
              if (!window.SigmaGoogle?.configured?.()) throw new Error('Client OAuth Google non configuré');
              await window.SigmaGoogle.pushDrive(ctx.getState());
              ctx.updateState((state) => {
                state.googleServices = state.googleServices || {};
                state.googleServices.drive = { connected: true, lastSync: new Date().toISOString() };
              });
              ctx.toast('Sauvegarde Google Drive terminée.');
            } catch (error) { ctx.toast(`Google Drive : ${error.message}`, 'error'); }
          })();
          return;
        }
        if (action === 'google-youtube') {
          event.preventDefault();
          (async () => {
            try {
              if (!window.SigmaGoogle?.configured?.()) throw new Error('Client OAuth Google non configuré');
              const subscriptions = await window.SigmaGoogle.importYouTube();
              ctx.updateState((state) => {
                state.socialAccounts = (state.socialAccounts || []).filter((row) => row.provider !== 'youtube' || !row.demo);
                if (!state.socialAccounts.some((row) => row.provider === 'youtube' && !row.demo)) state.socialAccounts.push({ id: 'google-youtube', provider: 'youtube', label: 'YouTube', status: 'connected', demo: false });
                state.youtubeSubscriptions = subscriptions;
              });
              ctx.toast(`${subscriptions.length} abonnement(s) YouTube importé(s).`);
            } catch (error) { ctx.toast(`YouTube : ${error.message}`, 'error'); }
          })();
          return;
        }
        ctx.toast(`${action}: ${copy().configure}`);
      }
    });

    const adminNav = document.getElementById('v17-admin-nav');
    const adminPanel = document.getElementById('panel-admin');
    function adminVisibility() {
      const show = Boolean(config.adminQaEnabled || ctx.isOwnerPreview());
      const betaBadge = document.getElementById('v17-admin-beta-badge');
      if (betaBadge) betaBadge.hidden = !Boolean(config.adminQaEnabled);
      if (adminNav) adminNav.hidden = !show;
      if (adminPanel) adminPanel.dataset.available = show ? 'true' : 'false';
    }
    ctx.subscribe(() => { adminVisibility(); render(); });
    document.addEventListener('languagechange', render);
    adminVisibility(); render();
    if (config.adminQaEnabled) window.setTimeout(runAdminTests, 400);
    return { render, runAdminTests };
  }

  window.SUM_MODULES = window.SUM_MODULES || {};
  window.SUM_MODULES.initExperienceV17 = initExperienceV17;
})();
