export function calculateScenarioCoverage(scenarios=[],requiredKinds=[]) {
  const covered=new Set(scenarios.flatMap(s=>s.steps.map(x=>x.kind)));
  const missing=requiredKinds.filter(k=>!covered.has(k));
  return {covered:[...covered],missing,score:requiredKinds.length?Math.round((requiredKinds.length-missing.length)/requiredKinds.length*100):100};
}
