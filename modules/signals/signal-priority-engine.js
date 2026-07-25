const CRITICAL = ['mise en demeure','amende','contravention','prélèvement rejeté','entretien demain','urgent','dernier rappel'];
const HIGH = ['facture','relance','échéance','école','recruteur','entretien','document à fournir','convocation','rendez-vous'];
export function prioritizeSignal(signal, classification={domain:'general',confidence:0}, now=new Date()) {
  const text = `${signal.title||''} ${signal.body||''}`.toLocaleLowerCase('fr');
  let risk = CRITICAL.some(k=>text.includes(k)) ? 5 : HIGH.some(k=>text.includes(k)) ? 3 : 1;
  let urgency = 1;
  if (signal.dueAt) { const hours=(new Date(signal.dueAt)-now)/36e5; urgency = hours < 0 ? 5 : hours <= 24 ? 5 : hours <= 72 ? 4 : hours <= 168 ? 3 : 2; }
  const impact = ['employment','school','finance','administration','health'].includes(classification.domain) ? 4 : 2;
  const score = Math.min(100, risk*10 + urgency*8 + impact*7 + Math.round((classification.confidence||0)*10));
  const priority = score >= 80 ? 'critical' : score >= 55 ? 'high' : score >= 30 ? 'medium' : 'low';
  return { priority, score, risk, urgency, impact, reasons:[`domain:${classification.domain}`,`risk:${risk}`,`urgency:${urgency}`,`impact:${impact}`] };
}
