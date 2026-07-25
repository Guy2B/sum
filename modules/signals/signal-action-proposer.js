export function proposeAction(signal, classification, priority) {
  const verbs={employment:'Répondre ou candidater',school:'Traiter le message de l’école',finance:'Vérifier et régler',administration:'Traiter la démarche administrative',health:'Préparer le suivi santé',calendar:'Préparer le rendez-vous',general:'Examiner le signal'};
  return { title:`${verbs[classification.domain]||verbs.general} : ${signal.title||'sans titre'}`, dueAt:signal.dueAt,
    priority:priority.priority, sourceSignalId:signal.id, requiresApproval:['critical','high'].includes(priority.priority),
    rationale:priority.reasons.join(', ') };
}
