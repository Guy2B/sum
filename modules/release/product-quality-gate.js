import { assertUtf8Document } from '../product/utf8-integrity.js';
export function evaluateProductQuality({ html, routes=[], actions=[] }) {
  const checks = { utf8:false, navigation:false, coreActions:false };
  try { checks.utf8=assertUtf8Document(html); } catch { checks.utf8=false; }
  checks.navigation=['today','goals','tasks','plan','reviews'].every(route=>routes.includes(route));
  checks.coreActions=['create-goal','create-task','complete-task','generate-plan','create-review','export','import'].every(action=>actions.includes(action));
  return { ready:Object.values(checks).every(Boolean), checks };
}
