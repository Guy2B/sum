export function createScenario({
  id,
  name,
  baseline={},
  assumptions=[],
  objectives=[],
  horizon='30d'
}={}){
  if(!id||!name) throw new Error('scenario id and name are required');
  return {
    id,
    name,
    baseline:structuredClone(baseline),
    assumptions:assumptions.map(item=>structuredClone(item)),
    objectives:objectives.map(item=>structuredClone(item)),
    horizon
  };
}
