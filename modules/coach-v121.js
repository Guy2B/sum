'use strict';
(() => {
  const BASE = window.SUM_COACH_ENGINE;
  if (!BASE) throw new Error('Σ Coach base engine is required');

  const COPY = {
    en: {
      greeting: 'Hello{name}. I am ready. We can organise your day, untangle a project, review money, or simply think something through together.',
      thanks: 'You are welcome. I am keeping the context of our exchange. What would be most useful next?',
      help: 'I work best with your Σ data. Ask me to prepare the day, prioritise tasks, break down a project, review spending, analyse habits, reflect on journal patterns, or build a learning plan.',
      identity: 'I am Σ, Σ’s local decision coach. I combine your entries with specialised rules and guided plans; I am not a general-purpose generative chatbot.',
      goodbye: 'Understood. Your workspace will still be here when you are ready to continue.',
      planLead: 'Here is a realistic plan based on your current workspace:',
      energyLow: 'Your energy is {energy}/10, so I am protecting a lighter pace.',
      energyOk: 'Your energy is {energy}/10, so focused blocks with short pauses should be realistic.',
      planQuestion: 'Does this order match what truly matters today?',
      breakdownLead: 'Let us make “{task}” easier to start.',
      breakdownQuestion: 'Which step feels unclear or blocked?',
      durationLead: 'Your visible workload is about {minutes} minutes across {count} open tasks.',
      durationQuestion: 'How much focused time do you actually have today?',
      roadmapLead: 'For “{project}”, the clearest route is:',
      roadmapQuestion: 'Should the first step become today’s priority?',
      riskLead: 'The main risks I can infer for “{project}” are:',
      riskQuestion: 'Which risk is already present rather than merely possible?',
      forecastLead: 'Based on this month’s entries, the 30-day direction is:',
      forecastQuestion: 'Do you expect a large income or expense that is not recorded yet?',
      subscriptionsLead: 'Σ cannot know whether a subscription is unused until you record or label it. I can still help you audit recurring costs.',
      subscriptionsQuestion: 'Which recurring payment should we review first?',
      habitLead: 'This is the pattern currently visible in your habit tracker:',
      habitQuestion: 'Which single habit would make the rest of the week easier?',
      emotionLead: 'I can only infer themes from your words and declared mood; this is not a diagnosis.',
      emotionQuestion: 'Does this summary feel accurate to you?',
      learningLead: 'A simple seven-day plan for “{skill}” could be:',
      learningQuestion: 'How many minutes can you realistically protect per session?',
      quizLead: 'I can build a useful quiz from notes or course points you provide.',
      quizQuestion: 'Paste 3 to 10 key points and I will turn them into questions.',
      noTasks: 'There are no open tasks yet. Tell me the result you need today and we will turn it into a first action.',
      noProject: 'There is no active project to structure yet. What outcome do you want to achieve?',
      noFinance: 'There are not enough financial entries for a grounded forecast yet.',
      noHabits: 'There are no habits to analyse yet. Choose one small behaviour you want to repeat.',
      noJournal: 'There are no journal entries to summarise yet.',
      noLearning: 'There is no learning objective yet. What would you like to be able to do?',
      stepClarify: 'Clarify the exact result and definition of done',
      stepGather: 'Gather the information or resources required',
      stepStart: 'Complete the smallest visible first action',
      stepReview: 'Review the result and choose the next action',
      riskScope: 'The desired result or scope may still be too broad',
      riskTime: 'No protected time block is visible in the current plan',
      riskDependency: 'A missing resource or decision may block the next step',
      positive: 'positive themes', pressure: 'pressure themes',
      entriesReviewed: '{count} entries reviewed',
      todayHabits: '{done}/{total} habits completed today',
      monthRate: '{rate}% completion this month',
      trackedHabits: '{count} habits tracked',
      forecast: 'Projected month balance: {amount}',
      sevenDay: 'Seven-day action plan',
      learnPractice: 'learn and practise',
      recallReview: 'recall and review'
    },
    fr: {
      greeting: 'Bonjour{name}. Je suis prêt. Nous pouvons organiser votre journée, débloquer un projet, revoir l’argent ou simplement réfléchir ensemble.',
      thanks: 'Avec plaisir. Je garde le contexte de notre échange. Qu’est-ce qui vous serait le plus utile maintenant ?',
      help: 'Je fonctionne surtout avec vos données Σ. Demandez-moi de préparer la journée, prioriser les tâches, décomposer un projet, revoir les dépenses, analyser les habitudes, synthétiser le journal ou construire un plan d’apprentissage.',
      identity: 'Je suis Σ, le coach décisionnel local de Σ. Je combine vos entrées avec des règles spécialisées et des plans guidés ; je ne suis pas un chatbot génératif généraliste.',
      goodbye: 'Compris. Votre espace restera ici lorsque vous voudrez reprendre.',
      planLead: 'Voici un plan réaliste à partir de votre espace actuel :',
      energyLow: 'Votre énergie est à {energy}/10 : je protège donc un rythme plus léger.',
      energyOk: 'Votre énergie est à {energy}/10 : des blocs concentrés avec de courtes pauses semblent réalistes.',
      planQuestion: 'Cet ordre correspond-il à ce qui compte vraiment aujourd’hui ?',
      breakdownLead: 'Rendons « {task} » plus facile à commencer.',
      breakdownQuestion: 'Quelle étape vous paraît encore floue ou bloquée ?',
      durationLead: 'Votre charge visible représente environ {minutes} minutes pour {count} tâches ouvertes.',
      durationQuestion: 'De combien de temps réellement concentré disposez-vous aujourd’hui ?',
      roadmapLead: 'Pour « {project} », le chemin le plus clair est :',
      roadmapQuestion: 'Souhaitez-vous transformer la première étape en priorité du jour ?',
      riskLead: 'Les principaux risques que je peux déduire pour « {project} » sont :',
      riskQuestion: 'Quel risque est déjà présent plutôt que seulement possible ?',
      forecastLead: 'À partir des écritures de ce mois, la tendance à 30 jours est :',
      forecastQuestion: 'Prévoyez-vous un revenu ou une dépense importante qui n’est pas encore enregistré ?',
      subscriptionsLead: 'Σ ne peut pas savoir qu’un abonnement est inutilisé tant qu’il n’est pas enregistré ou étiqueté. Je peux néanmoins vous aider à auditer les coûts récurrents.',
      subscriptionsQuestion: 'Quel paiement récurrent souhaitez-vous examiner en premier ?',
      habitLead: 'Voici le schéma actuellement visible dans votre suivi d’habitudes :',
      habitQuestion: 'Quelle habitude unique rendrait le reste de la semaine plus simple ?',
      emotionLead: 'Je peux seulement repérer des thèmes dans vos mots et votre humeur déclarée ; ce n’est pas un diagnostic.',
      emotionQuestion: 'Cette synthèse vous semble-t-elle juste ?',
      learningLead: 'Un plan simple sur sept jours pour « {skill} » pourrait être :',
      learningQuestion: 'Combien de minutes pouvez-vous réellement protéger par session ?',
      quizLead: 'Je peux créer un quiz utile à partir de notes ou de points de cours que vous me donnez.',
      quizQuestion: 'Collez 3 à 10 points importants et je les transformerai en questions.',
      noTasks: 'Aucune tâche ouverte pour le moment. Dites-moi le résultat nécessaire aujourd’hui et nous le transformerons en première action.',
      noProject: 'Aucun projet actif à structurer pour le moment. Quel résultat souhaitez-vous atteindre ?',
      noFinance: 'Il n’y a pas encore assez d’écritures financières pour une prévision fondée.',
      noHabits: 'Aucune habitude à analyser pour le moment. Choisissez un petit comportement à répéter.',
      noJournal: 'Aucune entrée de journal à synthétiser pour le moment.',
      noLearning: 'Aucun objectif d’apprentissage pour le moment. Que souhaitez-vous savoir faire ?',
      stepClarify: 'Clarifier le résultat exact et le critère de réussite',
      stepGather: 'Rassembler les informations ou ressources nécessaires',
      stepStart: 'Réaliser la plus petite première action visible',
      stepReview: 'Vérifier le résultat et choisir l’action suivante',
      riskScope: 'Le résultat attendu ou le périmètre peut encore être trop large',
      riskTime: 'Aucun bloc de temps protégé n’apparaît dans le plan actuel',
      riskDependency: 'Une ressource ou une décision manquante peut bloquer l’étape suivante',
      positive: 'thèmes positifs', pressure: 'thèmes de pression',
      entriesReviewed: '{count} entrées examinées',
      todayHabits: '{done}/{total} habitudes réalisées aujourd’hui',
      monthRate: '{rate}% de régularité ce mois-ci',
      trackedHabits: '{count} habitudes suivies',
      forecast: 'Solde mensuel projeté : {amount}',
      sevenDay: 'Plan d’action sur sept jours',
      learnPractice: 'apprendre et pratiquer',
      recallReview: 'rappeler et réviser'
    },
    de: {
      greeting: 'Hallo{name}. Ich bin bereit. Wir können den Tag ordnen, ein Projekt entwirren, Finanzen prüfen oder gemeinsam nachdenken.',
      thanks: 'Gern. Ich behalte den Kontext unseres Gesprächs. Was wäre jetzt am hilfreichsten?',
      help: 'Am besten arbeite ich mit Ihren Σ-Daten: Tagesplan, Prioritäten, Projektstruktur, Ausgaben, Gewohnheiten, Journal oder Lernplan.',
      identity: 'Ich bin Σ, der lokale Entscheidungscoach von Σ. Ich verbinde Ihre Einträge mit spezialisierten Regeln und geführten Plänen.',
      goodbye: 'Verstanden. Ihr Arbeitsbereich bleibt hier, wenn Sie fortfahren möchten.',
      planLead: 'Hier ist ein realistischer Plan auf Basis Ihres Arbeitsbereichs:',
      energyLow: 'Ihre Energie liegt bei {energy}/10, daher schütze ich ein leichteres Tempo.',
      energyOk: 'Ihre Energie liegt bei {energy}/10; fokussierte Blöcke mit kurzen Pausen sind realistisch.',
      planQuestion: 'Entspricht diese Reihenfolge dem, was heute wirklich zählt?',
      breakdownLead: 'Machen wir „{task}“ leichter startbar.', breakdownQuestion: 'Welcher Schritt ist noch unklar oder blockiert?',
      durationLead: 'Die sichtbare Arbeitslast beträgt ungefähr {minutes} Minuten für {count} offene Aufgaben.', durationQuestion: 'Wie viel konzentrierte Zeit haben Sie heute tatsächlich?',
      roadmapLead: 'Für „{project}“ ist der klarste Weg:', roadmapQuestion: 'Soll der erste Schritt zur heutigen Priorität werden?',
      riskLead: 'Die wichtigsten ableitbaren Risiken für „{project}“ sind:', riskQuestion: 'Welches Risiko besteht bereits?',
      forecastLead: 'Aus den Einträgen dieses Monats ergibt sich folgende 30-Tage-Richtung:', forecastQuestion: 'Erwarten Sie eine größere, noch nicht erfasste Einnahme oder Ausgabe?',
      subscriptionsLead: 'Σ erkennt ungenutzte Abos erst, wenn sie erfasst oder markiert sind. Ich kann wiederkehrende Kosten dennoch prüfen.', subscriptionsQuestion: 'Welche wiederkehrende Zahlung prüfen wir zuerst?',
      habitLead: 'Dieses Muster ist im Gewohnheitstracker sichtbar:', habitQuestion: 'Welche einzelne Gewohnheit würde den Rest der Woche erleichtern?',
      emotionLead: 'Ich kann nur Themen aus Ihren Worten und der angegebenen Stimmung ableiten; das ist keine Diagnose.', emotionQuestion: 'Fühlt sich diese Zusammenfassung zutreffend an?',
      learningLead: 'Ein einfacher Sieben-Tage-Plan für „{skill}“ könnte so aussehen:', learningQuestion: 'Wie viele Minuten können Sie pro Sitzung realistisch schützen?',
      quizLead: 'Aus Notizen oder Kurspunkten kann ich ein Quiz erstellen.', quizQuestion: 'Fügen Sie 3 bis 10 Kernpunkte ein.',
      noTasks: 'Es gibt noch keine offenen Aufgaben. Welches Ergebnis brauchen Sie heute?', noProject: 'Es gibt noch kein aktives Projekt. Welches Ergebnis möchten Sie erreichen?', noFinance: 'Für eine fundierte Prognose fehlen noch Finanzdaten.', noHabits: 'Es gibt noch keine Gewohnheiten zu analysieren.', noJournal: 'Es gibt noch keine Journaleinträge.', noLearning: 'Es gibt noch kein Lernziel.',
      stepClarify: 'Ergebnis und Definition von erledigt klären', stepGather: 'Informationen oder Ressourcen sammeln', stepStart: 'Die kleinste sichtbare erste Aktion erledigen', stepReview: 'Ergebnis prüfen und nächste Aktion wählen',
      riskScope: 'Ergebnis oder Umfang ist möglicherweise noch zu breit', riskTime: 'Kein geschützter Zeitblock ist sichtbar', riskDependency: 'Eine fehlende Ressource oder Entscheidung kann blockieren',
      positive: 'positive Themen', pressure: 'Belastungsthemen', entriesReviewed: '{count} Einträge geprüft', todayHabits: '{done}/{total} Gewohnheiten heute erledigt', monthRate: '{rate}% Regelmäßigkeit in diesem Monat', trackedHabits: '{count} Gewohnheiten erfasst', forecast: 'Prognostizierter Monatssaldo: {amount}', sevenDay: 'Sieben-Tage-Aktionsplan', learnPractice: 'lernen und üben', recallReview: 'abrufen und wiederholen'
    },
    es: {
      greeting: 'Hola{name}. Estoy listo. Podemos organizar el día, desbloquear un proyecto, revisar el dinero o pensar juntos.',
      thanks: 'Con gusto. Mantengo el contexto de nuestra conversación. ¿Qué sería más útil ahora?',
      help: 'Trabajo mejor con tus datos de Σ: plan diario, prioridades, proyectos, gastos, hábitos, diario o aprendizaje.',
      identity: 'Soy Σ, el coach local de decisiones de Σ. Combino tus entradas con reglas especializadas y planes guiados.',
      goodbye: 'Entendido. Tu espacio seguirá aquí cuando quieras continuar.',
      planLead: 'Este es un plan realista basado en tu espacio actual:',
      energyLow: 'Tu energía está en {energy}/10, por eso protejo un ritmo más ligero.',
      energyOk: 'Tu energía está en {energy}/10; los bloques de concentración con pausas cortas parecen realistas.',
      planQuestion: '¿Este orden refleja lo que realmente importa hoy?',
      breakdownLead: 'Hagamos que “{task}” sea más fácil de empezar.', breakdownQuestion: '¿Qué paso sigue confuso o bloqueado?',
      durationLead: 'La carga visible es de unos {minutes} minutos para {count} tareas abiertas.', durationQuestion: '¿Cuánto tiempo concentrado tienes realmente hoy?',
      roadmapLead: 'Para “{project}”, la ruta más clara es:', roadmapQuestion: '¿Convierto el primer paso en la prioridad de hoy?',
      riskLead: 'Los principales riesgos que puedo inferir para “{project}” son:', riskQuestion: '¿Qué riesgo ya está presente?',
      forecastLead: 'Según los registros de este mes, la dirección a 30 días es:', forecastQuestion: '¿Esperas un ingreso o gasto grande que aún no esté registrado?',
      subscriptionsLead: 'Σ no puede saber si una suscripción no se usa hasta que la registres o etiquetes. Aun así puedo revisar los costes recurrentes.', subscriptionsQuestion: '¿Qué pago recurrente revisamos primero?',
      habitLead: 'Este es el patrón visible en tus hábitos:', habitQuestion: '¿Qué único hábito haría más fácil el resto de la semana?',
      emotionLead: 'Solo puedo inferir temas de tus palabras y del ánimo declarado; no es un diagnóstico.', emotionQuestion: '¿Esta síntesis te parece correcta?',
      learningLead: 'Un plan sencillo de siete días para “{skill}” podría ser:', learningQuestion: '¿Cuántos minutos puedes proteger realmente por sesión?',
      quizLead: 'Puedo crear un cuestionario a partir de notas o puntos del curso.', quizQuestion: 'Pega entre 3 y 10 puntos clave.',
      noTasks: 'No hay tareas abiertas. Dime qué resultado necesitas hoy.', noProject: 'No hay un proyecto activo. ¿Qué resultado quieres alcanzar?', noFinance: 'Aún no hay suficientes registros financieros para una previsión fundada.', noHabits: 'No hay hábitos para analizar todavía.', noJournal: 'No hay entradas de diario para resumir.', noLearning: 'No hay un objetivo de aprendizaje todavía.',
      stepClarify: 'Aclarar el resultado exacto y la definición de terminado', stepGather: 'Reunir la información o los recursos necesarios', stepStart: 'Completar la primera acción visible más pequeña', stepReview: 'Revisar el resultado y elegir la siguiente acción',
      riskScope: 'El resultado o el alcance puede seguir siendo demasiado amplio', riskTime: 'No hay un bloque de tiempo protegido', riskDependency: 'Una decisión o recurso faltante puede bloquear el siguiente paso',
      positive: 'temas positivos', pressure: 'temas de presión', entriesReviewed: '{count} entradas revisadas', todayHabits: '{done}/{total} hábitos completados hoy', monthRate: '{rate}% de constancia este mes', trackedHabits: '{count} hábitos seguidos', forecast: 'Saldo mensual proyectado: {amount}', sevenDay: 'Plan de acción de siete días', learnPractice: 'aprender y practicar', recallReview: 'recordar y repasar'
    }
  };

  function normalize(value = '') {
    return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function say(ctx, key, variables = {}) {
    const language = ctx.language?.() || 'en';
    const source = COPY[language]?.[key] || COPY.en[key] || key;
    return String(source).replace(/\{(\w+)\}/g, (_, name) => variables[name] ?? '');
  }

  function bullets(items) {
    return items.filter(Boolean).map((item) => `• ${item}`).join('\n');
  }

  function detectSocial(prompt) {
    const value = normalize(prompt).trim();
    if (/^(bonjour|salut|hello|hi|hey|hallo|hola|bonsoir|guten morgen|buenos dias)\b/.test(value)) return 'greeting';
    if (/\b(merci|thank you|thanks|danke|gracias)\b/.test(value)) return 'thanks';
    if (/\b(qui es tu|who are you|wer bist du|quien eres)\b/.test(value)) return 'identity';
    if (/\b(que peux tu faire|what can you do|was kannst du|que puedes hacer|aide|help|hilfe|ayuda)\b/.test(value)) return 'help';
    if (/\b(au revoir|bye|goodbye|tschuss|adios|a bientot)\b/.test(value)) return 'goodbye';
    return '';
  }

  function detectCommand(prompt, intent) {
    const value = normalize(prompt);
    if (/\b(7 jours|sept jours|seven day|7 day|7 tage|siete dias)\b/.test(value)) return 'sevenDayPlan';
    if (/\b(preparer.*jour|prepare.*day|prepare.*tag|preparar.*dia|organis.*jour|organize.*day|organise.*day|organisier.*tag|organizar.*dia|plan du jour|daily plan)\b/.test(value)) return 'generalDay';
    if (intent === 'tasks' && /\b(decompos|sous.?tache|break down|subtask|zerleg|unteraufgabe|divid|subtarea)\b/.test(value)) return 'taskBreakdown';
    if (intent === 'tasks' && /\b(duree|temps|estimate|duration|how long|dauer|zeit|duracion|cuanto tiempo)\b/.test(value)) return 'taskDuration';
    if (intent === 'projects' && /\b(roadmap|feuille de route|planification|zeitplan|hoja de ruta)\b/.test(value)) return 'projectRoadmap';
    if (intent === 'projects' && /\b(risque|risk|risiko|riesgo)\b/.test(value)) return 'projectRisks';
    if (intent === 'finance' && /\b(prevision|forecast|30 jours|30 day|prognose|pronostico)\b/.test(value)) return 'financeForecast';
    if (intent === 'finance' && /\b(abonnement|subscription|abo|suscripcion)\b/.test(value)) return 'financeSubscriptions';
    if (intent === 'health' && /\b(habitude|habit|routine|gewohnheit|habito|pattern|schema|muster|patron)\b/.test(value)) return 'habitReview';
    if (intent === 'journal' && /\b(emotion|emotionnel|emotional|stimmung|emocion|synthese|summary|zusammenfassung|resumen)\b/.test(value)) return 'journalEmotion';
    if (intent === 'learning' && /\b(quiz|questionnaire|test)\b/.test(value)) return 'learningQuiz';
    if (intent === 'learning' && /\b(plan|programme|program|lernplan|programa)\b/.test(value)) return 'learningPlan';
    return '';
  }

  function taskRank(task) {
    const rank = { high: 0, medium: 1, low: 2 };
    return (rank[task.priority] ?? 1) * 100000 + (task.dueDate ? new Date(`${task.dueDate}T12:00:00`).getTime() / 86400000 : 99999);
  }

  function openTasks(state) {
    return state.tasks.filter((task) => !task.done && !task.inbox && task.status !== 'inbox').sort((a, b) => taskRank(a) - taskRank(b));
  }

  function monthlyFinance(state, ctx) {
    const month = ctx.today().slice(0, 7);
    const items = state.finance.filter((item) => item.date?.startsWith(month));
    const income = items.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expense = items.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { items, income, expense, balance: income - expense };
  }

  function projectSnapshot(state) {
    const projects = state.projects || [];
    const project = projects.find((item) => (item.steps || []).some((step) => !step.done)) || projects[0];
    return { project, steps: (project?.steps || []).filter((step) => !step.done).map((step) => step.title || step.text).filter(Boolean) };
  }

  function learningSnapshot(state) {
    return [...(state.learning || [])].sort((a, b) => Number(a.progress || 0) - Number(b.progress || 0))[0];
  }


  const DEEP_COPY = {
    en: {
      overviewTitle: 'Cross-workspace briefing', observed: 'I reviewed {tasks} open priorities, {projects} active projects, {mail} unread messages, {finance} month balance, {energy}/10 energy and {skills} learning goals.',
      pressure: 'The current pressure points are:', actions: 'The three most useful next moves are:', question: 'Which constraint should I protect first: time, energy, cash flow or a client commitment?',
      noPressure: 'No critical warning dominates the workspace. The best gain now is to preserve focus rather than add more work.',
      mailTitle: 'Mail and response briefing', mailObserved: '{unread} unread messages, {important} marked important and {replies} possible replies waiting.', mailQuestion: 'Should I turn the most important message into a task or prepare a response reminder?',
      healthTitle: 'Workload and recovery briefing', healthObserved: 'Recent averages: {sleep} h sleep, {energy}/10 energy, {stress}/10 stress, {steps} steps and about {minutes} minutes of open task load.', healthQuestion: 'Would you rather reduce today’s workload or protect a recovery block first?',
      learningTitle: 'Learning strategy briefing', learningObserved: '{skills} goals, {resources} resources and an average progress of {progress}%.', learningQuestion: 'What result should the next learning session produce: understanding, recall or practice?',
      sources: 'Signals used', confidence: 'Confidence', high: 'high', medium: 'medium', low: 'limited',
      overdue: '{count} overdue task(s)', replyRisk: '{count} message(s) may need a reply', lowEnergy: 'energy is low compared with the visible workload', negativeCash: 'the current month balance is negative', receipts: '{count} professional transaction(s) lack a receipt', stalled: '{count} project(s) appear stalled',
      doTask: 'Protect a focused block for “{task}”.', doMail: 'Review “{subject}” and decide whether to reply, delegate or archive it.', doProject: 'Move “{project}” with the next visible step: {step}.', doRecovery: 'Reduce the plan to one demanding task and add a recovery block.', doFinance: 'Review the largest expense category and missing receipts before new commitments.', doLearning: 'Schedule a short session for “{skill}” using one existing resource.'
    },
    fr: {
      overviewTitle: 'Briefing croisé de votre espace', observed: 'J’ai examiné {tasks} priorités ouvertes, {projects} projets actifs, {mail} messages non lus, un solde mensuel de {finance}, une énergie à {energy}/10 et {skills} objectifs d’apprentissage.',
      pressure: 'Les points de pression actuels sont :', actions: 'Les trois prochaines actions les plus utiles sont :', question: 'Quelle contrainte faut-il protéger d’abord : le temps, l’énergie, la trésorerie ou un engagement client ?',
      noPressure: 'Aucune alerte critique ne domine votre espace. Le meilleur gain consiste maintenant à protéger le focus plutôt qu’à ajouter du travail.',
      mailTitle: 'Briefing messagerie et réponses', mailObserved: '{unread} messages non lus, {important} importants et {replies} réponses potentiellement en attente.', mailQuestion: 'Souhaitez-vous transformer le message le plus important en tâche ou créer un rappel de réponse ?',
      healthTitle: 'Briefing charge et récupération', healthObserved: 'Moyennes récentes : {sleep} h de sommeil, énergie {energy}/10, stress {stress}/10, {steps} pas et environ {minutes} minutes de charge ouverte.', healthQuestion: 'Préférez-vous réduire la charge du jour ou protéger d’abord un bloc de récupération ?',
      learningTitle: 'Briefing stratégie d’apprentissage', learningObserved: '{skills} objectifs, {resources} ressources et une progression moyenne de {progress} %.', learningQuestion: 'Quel résultat doit produire la prochaine séance : comprendre, mémoriser ou pratiquer ?',
      sources: 'Signaux utilisés', confidence: 'Confiance', high: 'élevée', medium: 'moyenne', low: 'limitée',
      overdue: '{count} tâche(s) en retard', replyRisk: '{count} message(s) semblent nécessiter une réponse', lowEnergy: 'l’énergie est faible face à la charge visible', negativeCash: 'le solde du mois est négatif', receipts: '{count} transaction(s) professionnelle(s) sans justificatif', stalled: '{count} projet(s) semblent bloqués',
      doTask: 'Protégez un bloc concentré pour « {task} ».', doMail: 'Examinez « {subject} » et décidez : répondre, déléguer ou archiver.', doProject: 'Faites avancer « {project} » avec l’étape visible suivante : {step}.', doRecovery: 'Réduisez le plan à une tâche exigeante et ajoutez un bloc de récupération.', doFinance: 'Revoyez la principale catégorie de dépenses et les justificatifs manquants avant un nouvel engagement.', doLearning: 'Planifiez une courte séance sur « {skill} » à partir d’une ressource existante.'
    },
    de: {
      overviewTitle: 'Bereichsübergreifendes Briefing', observed: 'Ich habe {tasks} offene Prioritäten, {projects} aktive Projekte, {mail} ungelesene Nachrichten, einen Monatssaldo von {finance}, Energie {energy}/10 und {skills} Lernziele geprüft.',
      pressure: 'Aktuelle Druckpunkte:', actions: 'Die drei nützlichsten nächsten Schritte:', question: 'Welche Grenze soll zuerst geschützt werden: Zeit, Energie, Cashflow oder eine Kundenzusage?',
      noPressure: 'Keine kritische Warnung dominiert. Der größte Gewinn liegt jetzt darin, Fokus zu schützen statt mehr Arbeit hinzuzufügen.',
      mailTitle: 'Mail- und Antwortbriefing', mailObserved: '{unread} ungelesene Nachrichten, {important} wichtige und {replies} mögliche ausstehende Antworten.', mailQuestion: 'Soll die wichtigste Nachricht als Aufgabe oder Antworterinnerung erfasst werden?',
      healthTitle: 'Arbeitslast- und Erholungsbriefing', healthObserved: 'Jüngste Mittelwerte: {sleep} h Schlaf, Energie {energy}/10, Stress {stress}/10, {steps} Schritte und etwa {minutes} Minuten offene Aufgabenlast.', healthQuestion: 'Möchten Sie zuerst die heutige Last reduzieren oder einen Erholungsblock schützen?',
      learningTitle: 'Lernstrategie-Briefing', learningObserved: '{skills} Ziele, {resources} Ressourcen und durchschnittlich {progress}% Fortschritt.', learningQuestion: 'Soll die nächste Sitzung Verstehen, Abruf oder Praxis erzeugen?',
      sources: 'Verwendete Signale', confidence: 'Vertrauen', high: 'hoch', medium: 'mittel', low: 'begrenzt',
      overdue: '{count} überfällige Aufgabe(n)', replyRisk: '{count} Nachricht(en) könnten eine Antwort brauchen', lowEnergy: 'die Energie ist im Verhältnis zur sichtbaren Last niedrig', negativeCash: 'der aktuelle Monatssaldo ist negativ', receipts: '{count} berufliche Buchung(en) ohne Beleg', stalled: '{count} Projekt(e) wirken blockiert',
      doTask: 'Schützen Sie einen Fokusblock für „{task}“.', doMail: 'Prüfen Sie „{subject}“ und entscheiden Sie: antworten, delegieren oder archivieren.', doProject: 'Bewegen Sie „{project}“ mit dem nächsten sichtbaren Schritt: {step}.', doRecovery: 'Reduzieren Sie den Plan auf eine anspruchsvolle Aufgabe und ergänzen Sie Erholung.', doFinance: 'Prüfen Sie die größte Ausgabenkategorie und fehlende Belege vor neuen Verpflichtungen.', doLearning: 'Planen Sie eine kurze Sitzung für „{skill}“ mit einer vorhandenen Ressource.'
    },
    es: {
      overviewTitle: 'Resumen cruzado del espacio', observed: 'He revisado {tasks} prioridades abiertas, {projects} proyectos activos, {mail} mensajes sin leer, un saldo mensual de {finance}, energía {energy}/10 y {skills} objetivos de aprendizaje.',
      pressure: 'Los puntos de presión actuales son:', actions: 'Los tres siguientes pasos más útiles son:', question: '¿Qué límite debemos proteger primero: tiempo, energía, caja o un compromiso con un cliente?',
      noPressure: 'No domina ninguna alerta crítica. La mayor ganancia ahora es proteger el foco en lugar de añadir más trabajo.',
      mailTitle: 'Resumen de correo y respuestas', mailObserved: '{unread} mensajes sin leer, {important} importantes y {replies} posibles respuestas pendientes.', mailQuestion: '¿Convierto el mensaje más importante en tarea o preparo un recordatorio de respuesta?',
      healthTitle: 'Resumen de carga y recuperación', healthObserved: 'Promedios recientes: {sleep} h de sueño, energía {energy}/10, estrés {stress}/10, {steps} pasos y unas {minutes} minutos de carga abierta.', healthQuestion: '¿Prefieres reducir la carga de hoy o proteger primero un bloque de recuperación?',
      learningTitle: 'Resumen de estrategia de aprendizaje', learningObserved: '{skills} objetivos, {resources} recursos y un progreso medio del {progress}%.', learningQuestion: '¿Qué resultado debe producir la próxima sesión: comprensión, recuerdo o práctica?',
      sources: 'Señales utilizadas', confidence: 'Confianza', high: 'alta', medium: 'media', low: 'limitada',
      overdue: '{count} tarea(s) atrasada(s)', replyRisk: '{count} mensaje(s) pueden requerir respuesta', lowEnergy: 'la energía es baja frente a la carga visible', negativeCash: 'el saldo mensual actual es negativo', receipts: '{count} transacción(es) profesionales sin justificante', stalled: '{count} proyecto(s) parecen bloqueados',
      doTask: 'Protege un bloque de concentración para «{task}».', doMail: 'Revisa «{subject}» y decide: responder, delegar o archivar.', doProject: 'Haz avanzar «{project}» con el siguiente paso visible: {step}.', doRecovery: 'Reduce el plan a una tarea exigente y añade un bloque de recuperación.', doFinance: 'Revisa la mayor categoría de gasto y los justificantes faltantes antes de nuevos compromisos.', doLearning: 'Programa una sesión corta para «{skill}» con un recurso existente.'
    }
  };

  function deepSay(ctx, key, vars = {}) {
    let text = DEEP_COPY[ctx.language()]?.[key] || DEEP_COPY.en[key] || key;
    Object.entries(vars).forEach(([name, value]) => { text = text.replaceAll(`{${name}}`, String(value)); });
    return text;
  }

  function crossSnapshot(state, ctx) {
    const today = ctx.today();
    const tasks = openTasks(state);
    const overdue = tasks.filter((task) => task.dueDate && task.dueDate < today);
    const minutes = tasks.reduce((sum, task) => sum + Number(task.estimate || 30), 0);
    const projects = (state.projects || []).filter((project) => project.status !== 'completed' && project.status !== 'archived');
    const stalled = projects.filter((project) => {
      const steps = project.steps || [];
      return steps.length && !steps.some((step) => step.done) && (!project.updatedAt || Date.now() - new Date(project.updatedAt || project.createdAt || Date.now()).getTime() > 3 * 86400000);
    });
    const mail = (state.mailMessages || []).filter((item) => !item.archived);
    const unread = mail.filter((item) => item.unread || item.read === false);
    const important = mail.filter((item) => item.important || item.priority === 'high' || item.importance === 'high');
    const replies = mail.filter((item) => item.needsReply || item.replyDue || item.followUp);
    const finance = monthlyFinance(state, ctx);
    const missingReceipts = finance.items.filter((item) => item.professional && item.type === 'expense' && !item.receipt);
    const health = [...(state.health || [])].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 7);
    const avg = (key, fallback = 0) => health.length ? health.reduce((sum, item) => sum + Number(item[key] || fallback), 0) / health.length : fallback;
    const energy = Math.round(Number(state.settings.todayEnergy || avg('energy', 7)));
    const habits = state.habits || [];
    const habitsDone = habits.filter((habit) => state.habitLogs.some((log) => log.habitId === habit.id && log.date === today && log.done)).length;
    const learning = state.learning || [];
    const resources = state.learningResources || [];
    const learningProgress = learning.length ? Math.round(learning.reduce((sum, item) => sum + Number(item.progress || 0), 0) / learning.length) : 0;
    const journal = [...(state.journal || [])].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 10);
    return { tasks, overdue, minutes, projects, stalled, unread, important, replies, finance, missingReceipts, health, sleep: avg('sleep'), energy, stress: avg('stress'), steps: Math.round(avg('steps')), habits, habitsDone, learning, resources, learningProgress, journal };
  }

  function contextSummary(state, ctx) {
    const snap = crossSnapshot(state, ctx);
    return JSON.stringify({
      edition: ctx.edition().name,
      openTasks: snap.tasks.length, overdueTasks: snap.overdue.length, taskMinutes: snap.minutes,
      activeProjects: snap.projects.length, stalledProjects: snap.stalled.length,
      unreadMail: snap.unread.length, importantMail: snap.important.length, replyReminders: snap.replies.length,
      monthIncome: snap.finance.income, monthExpenses: snap.finance.expense, monthBalance: snap.finance.balance, missingReceipts: snap.missingReceipts.length,
      sleepAverage: Number(snap.sleep.toFixed(1)), energy: snap.energy, stressAverage: Number(snap.stress.toFixed(1)), stepsAverage: snap.steps,
      habitsDoneToday: snap.habitsDone, habitsTracked: snap.habits.length,
      learningGoals: snap.learning.length, learningResources: snap.resources.length, learningProgress: snap.learningProgress,
      journalEntriesReviewed: snap.journal.length
    });
  }

  function deepIntent(prompt) {
    const value = normalize(prompt);
    const score = { overview: 0, mail: 0, health: 0, learning: 0 };
    const add = (key, words, weight = 1) => words.forEach((word) => { if (value.includes(word)) score[key] += weight; });
    add('overview', ['guide moi','accompagne','situation','ensemble','global','briefing','quoi faire','priorite aujourd','overview','whole picture','what should i do','guide me','gesamt','uberblick','que hago','panorama'], 2);
    add('mail', ['mail','email','e-mail','courriel','message','repond','reply','inbox','postfach','correo','respuesta'], 3);
    add('health', ['fatigue','energie','sommeil','stress','charge','recovery','sleep','energy','workload','erholung','schlaf','carga','recuperacion'], 2);
    add('learning', ['apprendre','apprentissage','strategie','livre','manuel','cours','resource','learn','study','book','manual','lernen','buch','aprender','libro'], 2);
    return Object.entries(score).sort((a,b) => b[1]-a[1])[0][1] ? Object.entries(score).sort((a,b) => b[1]-a[1])[0][0] : '';
  }

  function deepResponse(kind, state, ctx) {
    const snap = crossSnapshot(state, ctx);
    if (kind === 'mail') {
      const top = snap.important[0] || snap.replies[0] || snap.unread[0];
      const actions = top ? [deepSay(ctx, 'doMail', { subject: top.subject || top.title || 'message' })] : [];
      if (snap.tasks[0]) actions.push(deepSay(ctx, 'doTask', { task: snap.tasks[0].title }));
      return { intent: 'mail', pendingSlot: '', suggestions: ['generalDay', 'tasksPrioritise'], text: `**${deepSay(ctx,'mailTitle')}**

${deepSay(ctx,'mailObserved',{unread:snap.unread.length,important:snap.important.length,replies:snap.replies.length})}

${actions.length ? bullets(actions) : deepSay(ctx,'noPressure')}

${deepSay(ctx,'mailQuestion')}

_${deepSay(ctx,'sources')}: mail, tasks · ${deepSay(ctx,'confidence')}: ${top ? deepSay(ctx,'high') : deepSay(ctx,'low')}_` };
    }
    if (kind === 'health') {
      const actions = [];
      if (snap.energy <= 4 || snap.sleep < 6.5) actions.push(deepSay(ctx,'doRecovery'));
      if (snap.tasks[0]) actions.push(deepSay(ctx,'doTask',{task:snap.tasks[0].title}));
      return { intent: 'health', pendingSlot: '', suggestions: ['healthEnergy','generalDay'], text: `**${deepSay(ctx,'healthTitle')}**

${deepSay(ctx,'healthObserved',{sleep:snap.sleep.toFixed(1),energy:snap.energy,stress:snap.stress.toFixed(1),steps:snap.steps,minutes:snap.minutes})}

${bullets(actions.length ? actions : [deepSay(ctx,'noPressure')])}

${deepSay(ctx,'healthQuestion')}

_${deepSay(ctx,'sources')}: health, tasks, habits · ${deepSay(ctx,'confidence')}: ${snap.health.length >= 3 ? deepSay(ctx,'high') : deepSay(ctx,'medium')}_` };
    }
    if (kind === 'learning') {
      const skill = [...snap.learning].sort((a,b)=>Number(a.progress||0)-Number(b.progress||0))[0];
      const actions = [];
      if (skill) actions.push(deepSay(ctx,'doLearning',{skill:skill.name}));
      if (snap.tasks[0] && snap.minutes > 240) actions.push(deepSay(ctx,'doRecovery'));
      return { intent: 'learning', pendingSlot: skill ? '' : 'learningGoal', suggestions: ['learningPlan','generalReview'], text: `**${deepSay(ctx,'learningTitle')}**

${deepSay(ctx,'learningObserved',{skills:snap.learning.length,resources:snap.resources.length,progress:snap.learningProgress})}

${bullets(actions.length ? actions : [say(ctx,'noLearning')])}

${deepSay(ctx,'learningQuestion')}

_${deepSay(ctx,'sources')}: learning, resources, calendar, workload · ${deepSay(ctx,'confidence')}: ${snap.learning.length ? deepSay(ctx,'high') : deepSay(ctx,'low')}_` };
    }
    const risks = [];
    if (snap.overdue.length) risks.push(deepSay(ctx,'overdue',{count:snap.overdue.length}));
    if (snap.replies.length) risks.push(deepSay(ctx,'replyRisk',{count:snap.replies.length}));
    if (snap.energy <= 4 && snap.minutes > 120) risks.push(deepSay(ctx,'lowEnergy'));
    if (snap.finance.items.length && snap.finance.balance < 0) risks.push(deepSay(ctx,'negativeCash'));
    if (snap.missingReceipts.length) risks.push(deepSay(ctx,'receipts',{count:snap.missingReceipts.length}));
    if (snap.stalled.length) risks.push(deepSay(ctx,'stalled',{count:snap.stalled.length}));
    const actions = [];
    if (snap.tasks[0]) actions.push(deepSay(ctx,'doTask',{task:snap.tasks[0].title}));
    const mail = snap.important[0] || snap.replies[0];
    if (mail) actions.push(deepSay(ctx,'doMail',{subject:mail.subject || mail.title || 'message'}));
    const project = snap.projects.find((item)=>(item.steps||[]).some((step)=>!step.done));
    const step = project?.steps?.find((item)=>!item.done);
    if (project && step) actions.push(deepSay(ctx,'doProject',{project:project.name,step:step.title || step.text}));
    if (actions.length < 3 && (snap.energy <= 4 || snap.sleep < 6.5)) actions.push(deepSay(ctx,'doRecovery'));
    if (actions.length < 3 && snap.finance.balance < 0) actions.push(deepSay(ctx,'doFinance'));
    if (actions.length < 3 && snap.learning[0]) actions.push(deepSay(ctx,'doLearning',{skill:snap.learning[0].name}));
    return { intent: 'general', pendingSlot: '', suggestions: ['generalDay','tasksPrioritise','generalReview'], text: `**${deepSay(ctx,'overviewTitle')}**

${deepSay(ctx,'observed',{tasks:snap.tasks.length,projects:snap.projects.length,mail:snap.unread.length,finance:ctx.currency(snap.finance.balance),energy:snap.energy,skills:snap.learning.length})}

**${deepSay(ctx,'pressure')}**
${risks.length ? bullets(risks) : deepSay(ctx,'noPressure')}

**${deepSay(ctx,'actions')}**
${bullets(actions.slice(0,3))}

${deepSay(ctx,'question')}

_${deepSay(ctx,'sources')}: tasks, projects, mail, finance, health, habits, learning · ${deepSay(ctx,'confidence')}: ${[snap.tasks.length,snap.projects.length,snap.finance.items.length,snap.health.length,snap.unread.length].filter(Boolean).length >= 3 ? deepSay(ctx,'high') : deepSay(ctx,'medium')}_` };
  }

  function enhancedResponse(prompt, state, ctx) {
    if (state.coachSession?.pendingSlot) return BASE.buildResponse(prompt, state, ctx);

    const social = detectSocial(prompt);
    if (social) {
      const name = state.settings?.name ? ` ${state.settings.name}` : '';
      const editionLine = social === 'greeting' ? `

${ctx.edition().coachWelcome}` : '';
      return { intent: state.coachSession?.intent || 'general', pendingSlot: '', suggestions: [], text: `${say(ctx, social, { name })}${editionLine}` };
    }

    const deep = deepIntent(prompt);
    if (deep) return deepResponse(deep, state, ctx);

    const intent = BASE.detectIntent(prompt);
    const command = detectCommand(prompt, intent);
    const tasks = openTasks(state);
    const top = tasks.slice(0, 3);
    const recentHealth = [...state.health].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    const energy = Math.round(Number(state.settings.todayEnergy || recentHealth?.energy || 7));

    if (command === 'generalDay' || command === 'sevenDayPlan') {
      if (!top.length) return { intent: 'tasks', pendingSlot: 'taskGoal', text: say(ctx, 'noTasks'), suggestions: ['tasksAdd'] };
      const list = top.map((task, index) => `${index + 1}. ${task.title} — ${Number(task.estimate || 30)} min`).join('\n');
      const lead = command === 'sevenDayPlan' ? `${say(ctx, 'sevenDay')}\n${say(ctx, 'planLead')}` : say(ctx, 'planLead');
      const energyText = energy <= 4 ? say(ctx, 'energyLow', { energy }) : say(ctx, 'energyOk', { energy });
      return { intent: 'tasks', pendingSlot: '', suggestions: ['tasksPrioritise', 'projectNext'], text: `${lead}\n\n${list}\n\n${energyText}\n\n${say(ctx, 'planQuestion')}` };
    }

    if (command === 'taskBreakdown') {
      const task = top[0];
      if (!task) return { intent: 'tasks', pendingSlot: 'taskGoal', text: say(ctx, 'noTasks'), suggestions: ['tasksAdd'] };
      return { intent: 'tasks', pendingSlot: '', suggestions: ['tasksPrioritise', 'generalDay'], text: `${say(ctx, 'breakdownLead', { task: task.title })}\n\n${bullets([say(ctx, 'stepClarify'), say(ctx, 'stepGather'), say(ctx, 'stepStart'), say(ctx, 'stepReview')])}\n\n${say(ctx, 'breakdownQuestion')}` };
    }

    if (command === 'taskDuration') {
      if (!tasks.length) return { intent: 'tasks', pendingSlot: 'taskGoal', text: say(ctx, 'noTasks'), suggestions: ['tasksAdd'] };
      const minutes = tasks.reduce((sum, task) => sum + Number(task.estimate || 30), 0);
      return { intent: 'tasks', pendingSlot: '', suggestions: ['generalDay', 'tasksPrioritise'], text: `${say(ctx, 'durationLead', { minutes, count: tasks.length })}\n\n${say(ctx, 'durationQuestion')}` };
    }

    if (command === 'projectRoadmap' || command === 'projectRisks') {
      const data = projectSnapshot(state);
      if (!data.project) return { intent: 'projects', pendingSlot: 'projectGoal', text: say(ctx, 'noProject'), suggestions: ['projectNext'] };
      if (command === 'projectRisks') {
        return { intent: 'projects', pendingSlot: '', suggestions: ['projectNext', 'sevenDayPlan'], text: `${say(ctx, 'riskLead', { project: data.project.name })}\n\n${bullets([say(ctx, 'riskScope'), say(ctx, 'riskTime'), say(ctx, 'riskDependency')])}\n\n${say(ctx, 'riskQuestion')}` };
      }
      const roadmap = data.steps.length ? data.steps.slice(0, 5) : [say(ctx, 'stepClarify'), say(ctx, 'stepStart'), say(ctx, 'stepReview')];
      return { intent: 'projects', pendingSlot: '', suggestions: ['sevenDayPlan', 'tasksPrioritise'], text: `${say(ctx, 'roadmapLead', { project: data.project.name })}\n\n${roadmap.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\n${say(ctx, 'roadmapQuestion')}` };
    }

    if (command === 'financeForecast') {
      const data = monthlyFinance(state, ctx);
      if (!data.items.length) return { intent: 'finance', pendingSlot: 'financeGoal', text: say(ctx, 'noFinance'), suggestions: ['financeBudget'] };
      const now = new Date();
      const day = Math.max(1, now.getDate());
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const forecastExpense = data.expense / day * daysInMonth;
      const projectedBalance = data.income - forecastExpense;
      return { intent: 'finance', pendingSlot: '', suggestions: ['financeBudget', 'financeReview'], text: `${say(ctx, 'forecastLead')}\n\n${bullets([`${ctx.t('finance.totalIncome')}: ${ctx.currency(data.income)}`, `${ctx.t('finance.totalExpense')}: ${ctx.currency(data.expense)}`, `${ctx.t('finance.balance')}: ${ctx.currency(data.balance)}`, say(ctx, 'forecast', { amount: ctx.currency(projectedBalance) })])}\n\n${say(ctx, 'forecastQuestion')}` };
    }

    if (command === 'financeSubscriptions') {
      return { intent: 'finance', pendingSlot: 'financeGoal', suggestions: ['financeBudget', 'financeReview'], text: `${say(ctx, 'subscriptionsLead')}\n\n${say(ctx, 'subscriptionsQuestion')}` };
    }

    if (command === 'habitReview') {
      if (!state.habits.length) return { intent: 'health', pendingSlot: 'healthSignal', text: say(ctx, 'noHabits'), suggestions: ['healthEnergy'] };
      const month = ctx.today().slice(0, 7);
      const completed = state.habitLogs.filter((log) => log.done && String(log.date).startsWith(month)).length;
      const possible = Math.max(1, state.habits.length * new Date().getDate());
      const rate = Math.round(completed / possible * 100);
      const todayDone = state.habits.filter((habit) => state.habitLogs.some((log) => log.habitId === habit.id && log.date === ctx.today() && log.done)).length;
      return { intent: 'health', pendingSlot: '', suggestions: ['healthEnergy', 'generalReview'], text: `${say(ctx, 'habitLead')}\n\n${bullets([say(ctx, 'todayHabits', { done: todayDone, total: state.habits.length }), say(ctx, 'monthRate', { rate }), say(ctx, 'trackedHabits', { count: state.habits.length })])}\n\n${say(ctx, 'habitQuestion')}` };
    }

    if (command === 'journalEmotion') {
      if (!state.journal.length) return { intent: 'journal', pendingSlot: 'journalTopic', text: say(ctx, 'noJournal'), suggestions: ['journalReflect'] };
      const recent = [...state.journal].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 12);
      const text = normalize(recent.map((entry) => entry.text).join(' '));
      const positive = ['merci', 'heureux', 'calme', 'fier', 'reussi', 'good', 'happy', 'calm', 'proud', 'danke', 'ruhig', 'feliz', 'tranquilo'].filter((word) => text.includes(word)).length;
      const pressure = ['stress', 'fatigue', 'peur', 'retard', 'pressure', 'tired', 'worry', 'mude', 'angst', 'cansado', 'miedo'].filter((word) => text.includes(word)).length;
      return { intent: 'journal', pendingSlot: '', suggestions: ['journalReflect', 'generalReview'], text: `${say(ctx, 'emotionLead')}\n\n${bullets([say(ctx, 'entriesReviewed', { count: recent.length }), `${say(ctx, 'positive')}: ${positive}`, `${say(ctx, 'pressure')}: ${pressure}`])}\n\n${say(ctx, 'emotionQuestion')}` };
    }

    if (command === 'learningQuiz') {
      return { intent: 'learning', pendingSlot: 'learningGoal', suggestions: ['learningPlan'], text: `${say(ctx, 'quizLead')}\n\n${say(ctx, 'quizQuestion')}` };
    }

    if (command === 'learningPlan') {
      const skill = learningSnapshot(state);
      if (!skill) return { intent: 'learning', pendingSlot: 'learningGoal', text: say(ctx, 'noLearning'), suggestions: ['learningPlan'] };
      const sessions = [1, 2, 3, 4, 5, 6, 7].map((day) => `${day}. ${day % 2 ? `20 min · ${say(ctx, 'learnPractice')}` : `15 min · ${say(ctx, 'recallReview')}`}`).join('\n');
      return { intent: 'learning', pendingSlot: '', suggestions: ['learningProgress', 'generalReview'], text: `${say(ctx, 'learningLead', { skill: skill.name })}\n\n${sessions}\n\n${say(ctx, 'learningQuestion')}` };
    }

    return BASE.buildResponse(prompt, state, ctx);
  }

  function initCoach(ctx) {
    const insightsRoot = document.getElementById('coach-insights');
    const historyRoot = document.getElementById('coach-history');
    const suggestionsRoot = document.getElementById('coach-suggestions');
    const quota = document.getElementById('coach-quota');
    const form = document.getElementById('coach-form');
    const input = document.getElementById('coach-input');
    const runButton = document.getElementById('coach-run');
    const topicPicker = document.querySelector('.coach-topic-picker');
    const resetContext = document.getElementById('coach-reset-context');
    const submitButton = form.querySelector('button[type="submit"]');
    const aiToggle = document.getElementById('coach-ai-toggle');
    const aiStatus = document.getElementById('coach-ai-status');
    const signalStrip = document.getElementById('coach-signal-strip');
    let isTyping = false;

    const promptKeys = {
      general: 'coach.prompt.generalDay', tasks: 'coach.prompt.tasksPrioritise', projects: 'coach.prompt.projectNext', finance: 'coach.prompt.financeBudget', health: 'coach.prompt.healthEnergy', learning: 'coach.prompt.learningPlan', journal: 'coach.prompt.journalReflect'
    };

    function renderQuota() {
      quota.textContent = ctx.isPro() ? ctx.t('coach.proUnlimited') : `${ctx.getCoachUsage()} / ${window.SUM_CONFIG.freeCoachLimit}`;
    }

    function renderSignalStrip() {
      if (!signalStrip) return;
      const snap = crossSnapshot(ctx.getState(), ctx);
      const signals = [
        ['✓', ctx.t('nav.tasks'), snap.tasks.length],
        ['✉', ctx.t('mail.nav'), snap.unread.length],
        ['€', ctx.t('nav.finance'), snap.finance.items.length],
        ['♡', ctx.t('nav.health'), snap.health.length],
        ['↗', ctx.t('nav.learning'), snap.resources.length || snap.learning.length]
      ];
      signalStrip.innerHTML = signals.map(([icon, label, value]) => `<span class="coach-signal ${Number(value) ? 'active' : ''}"><b>${icon}</b><small>${ctx.escape(label)}</small><strong>${Number(value) || 0}</strong></span>`).join('');
    }

    async function renderAiStatus() {
      if (!aiToggle || !aiStatus) return;
      const enabled = Boolean(ctx.getState().settings.localAiEnabled);
      const status = await window.SUM_LOCAL_AI?.availability(ctx.language());
      aiToggle.dataset.state = enabled && status !== 'unavailable' && status !== 'disabled' ? 'active' : status || 'unavailable';
      aiStatus.textContent = enabled ? (status === 'available' ? ctx.t('coach.localAiReady') : status === 'downloadable' || status === 'downloading' ? ctx.t('coach.localAiPreparing') : ctx.t('coach.guidedEngine')) : ctx.t('coach.guidedEngine');
    }

    function renderInsights() {
      const items = ctx.getState().coachInsights || [];
      insightsRoot.innerHTML = items.length ? items.map((item) => `<button class="insight-card" data-tone="${item.tone || 'neutral'}" data-insight-panel="${item.panel}" type="button">
        <div class="insight-top"><h3>${ctx.escape(item.title)}</h3><span class="insight-priority">${item.tone === 'positive' ? ctx.t('coach.positive') : item.priority >= 85 ? ctx.t('coach.high') : ctx.t('coach.medium')}</span></div>
        <p>${ctx.escape(item.text)}</p>
      </button>`).join('') : `<div class="empty-state">${ctx.t('coach.empty')}</div>`;
    }

    function markdownLite(text) {
      return ctx.escape(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    }

    function renderHistory() {
      const entries = ctx.getState().coachHistory || [];
      const panelForIntent = { general: 'dashboard', tasks: 'tasks', projects: 'projects', finance: 'finance', health: 'health', learning: 'learning', journal: 'journal', mail: 'mail' };
      const messages = entries.map((entry) => {
        const panel = entry.role === 'assistant' ? panelForIntent[entry.intent] : '';
        const action = panel ? `<div class="message-actions"><button type="button" data-message-panel="${panel}">${ctx.escape(ctx.t('coach.openModule'))}</button></div>` : '';
        return `<div class="message ${entry.role}"><div class="message-avatar">${entry.role === 'user' ? ctx.escape(ctx.t('coach.user').slice(0, 1)) : 'Σ'}</div><div class="message-bubble">${markdownLite(entry.text)}${action}</div></div>`;
      }).join('');
      const typing = isTyping ? `<div class="message assistant typing"><div class="message-avatar">Σ</div><div class="message-bubble" aria-label="${ctx.escape(ctx.t('coach.thinking'))}"><span class="typing-dots"><i></i><i></i><i></i></span></div></div>` : '';
      const edition = ctx.edition();
      historyRoot.innerHTML = entries.length || isTyping ? `${messages}${typing}` : `<div class="ai-welcome"><div class="ai-orb">Σ</div><span class="edition-badge compact">${ctx.escape(edition.name)}</span><h3>${ctx.t('coach.title')}</h3><p>${ctx.escape(edition.coachWelcome)}</p></div>`;
      historyRoot.scrollTo({ top: historyRoot.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }

    function renderSuggestions(keys) {
      if (Array.isArray(keys) && keys.length) {
        suggestionsRoot.innerHTML = keys.map((key) => `<button type="button" data-coach-prompt="${key}">${ctx.escape(ctx.t(`coach.prompt.${key}`))}</button>`).join('');
        return;
      }
      suggestionsRoot.innerHTML = ctx.edition().prompts.map(([label, prompt]) => `<button type="button" data-coach-text="${ctx.escape(prompt)}"><span>Σ</span>${ctx.escape(label)}</button>`).join('');
    }

    function runAnalysis(options = {}) {
      if (!options.freeBrief && !ctx.consumeCoachUse()) {
        ctx.toast(ctx.t('coach.limitShort'), 'error');
        ctx.openUpgrade();
        return [];
      }
      const items = BASE.analyse(ctx.getState(), ctx);
      ctx.updateState((state) => {
        state.coachInsights = items;
        state.lastCoachRun = new Date().toISOString();
      });
      renderQuota();
      return items;
    }

    async function submitPrompt(prompt) {
      const clean = String(prompt || '').trim();
      if (!clean || isTyping) return;
      if (!ctx.consumeCoachUse()) {
        ctx.toast(ctx.t('coach.limitShort'), 'error');
        ctx.openUpgrade();
        return;
      }
      ctx.updateState((state) => {
        state.coachHistory.push({ id: ctx.uid(), role: 'user', text: clean, createdAt: new Date().toISOString() });
      });
      input.value = '';
      input.style.height = '';
      isTyping = true;
      submitButton.disabled = true;
      renderHistory();
      const delay = Math.min(1050, Math.max(420, 360 + clean.length * 7));
      await new Promise((resolve) => window.setTimeout(resolve, delay));
      const result = enhancedResponse(clean, ctx.getState(), ctx);
      if (ctx.getState().settings.localAiEnabled && window.SUM_LOCAL_AI) {
        result.text = await window.SUM_LOCAL_AI.enhance({ prompt: clean, deterministicText: result.text, contextSummary: contextSummary(ctx.getState(), ctx), language: ctx.language() });
      }
      isTyping = false;
      submitButton.disabled = false;
      ctx.updateState((state) => {
        state.coachHistory.push({ id: ctx.uid(), role: 'assistant', text: result.text, createdAt: new Date().toISOString(), intent: result.intent });
        state.coachInsights = BASE.analyse(state, ctx);
        state.coachSession = { intent: result.intent || 'general', pendingSlot: result.pendingSlot || '', context: { suggestions: result.suggestions || [] } };
      });
      renderSuggestions(result.suggestions);
      renderQuota();
      input.focus();
    }

    aiToggle?.addEventListener('click', async () => {
      const currentlyEnabled = Boolean(ctx.getState().settings.localAiEnabled);
      if (currentlyEnabled) {
        window.SUM_LOCAL_AI?.destroy();
        ctx.updateState((state) => { state.settings.localAiEnabled = false; });
        ctx.toast(ctx.t('coach.localAiDisabled'));
        renderAiStatus();
        return;
      }
      aiToggle.disabled = true;
      aiStatus.textContent = ctx.t('coach.localAiPreparing');
      const prepared = await window.SUM_LOCAL_AI?.prepare(ctx.language(), (progress) => { aiStatus.textContent = `${ctx.t('coach.localAiPreparing')} ${progress}%`; });
      aiToggle.disabled = false;
      if (prepared?.ok) {
        ctx.updateState((state) => { state.settings.localAiEnabled = true; });
        ctx.toast(ctx.t('coach.localAiEnabled'));
      } else {
        ctx.toast(ctx.t('coach.localAiUnavailable'), 'error');
      }
      renderAiStatus();
    });

    runButton.addEventListener('click', () => runAnalysis());
    document.addEventListener('sum:coach-run', () => {
      ctx.navigate('coach');
      window.setTimeout(() => runAnalysis(), 180);
    });
    document.addEventListener('sum:coach-prompt', (event) => {
      const key = event.detail?.key || 'generalDay';
      const prompt = event.detail?.text || ctx.t(`coach.prompt.${key}`);
      ctx.navigate('coach');
      window.setTimeout(() => submitPrompt(prompt), 220);
    });

    insightsRoot.addEventListener('click', (event) => {
      const button = event.target.closest('[data-insight-panel]');
      if (button) ctx.navigate(button.dataset.insightPanel);
    });

    historyRoot.addEventListener('click', (event) => {
      const button = event.target.closest('[data-message-panel]');
      if (button) ctx.navigate(button.dataset.messagePanel);
    });

    resetContext.addEventListener('click', () => {
      isTyping = false;
      submitButton.disabled = false;
      ctx.updateState((state) => {
        state.coachHistory = [];
        state.coachSession = { intent: 'general', pendingSlot: '', context: {} };
      });
      renderSuggestions();
      input.focus();
    });

    topicPicker.addEventListener('click', (event) => {
      const button = event.target.closest('[data-coach-topic]');
      if (!button) return;
      topicPicker.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
      const key = promptKeys[button.dataset.coachTopic] || promptKeys.general;
      input.placeholder = ctx.t(key);
      input.value = ctx.t(key);
      input.focus();
    });

    suggestionsRoot.addEventListener('click', (event) => {
      const button = event.target.closest('[data-coach-prompt], [data-coach-text]');
      if (!button) return;
      submitPrompt(button.dataset.coachText || ctx.t(`coach.prompt.${button.dataset.coachPrompt}`));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitPrompt(input.value);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = `${Math.min(120, input.scrollHeight)}px`;
    });

    ctx.subscribe(() => { renderInsights(); renderHistory(); renderQuota(); renderSignalStrip(); renderSuggestions(ctx.getState().coachSession?.context?.suggestions); renderAiStatus(); });
    document.addEventListener('languagechange', () => {
      const translated = BASE.analyse(ctx.getState(), ctx);
      ctx.updateState((state) => { state.coachInsights = translated; });
      renderSuggestions(ctx.getState().coachSession?.context?.suggestions);
      renderQuota();
      renderSignalStrip();
      renderAiStatus();
    });
    renderInsights();
    renderHistory();
    renderSuggestions(ctx.getState().coachSession?.context?.suggestions);
    renderQuota();
    renderSignalStrip();
    renderAiStatus();
    return { runAnalysis, analyse: () => BASE.analyse(ctx.getState(), ctx) };
  }

  window.SUM_MODULES = window.SUM_MODULES || {};
  window.SUM_MODULES.initCoach = initCoach;
  window.SUM_COACH_ENGINE.enhancedResponse = enhancedResponse;
  window.SUM_COACH_ENGINE.contextSummary = contextSummary;
})();
