export function createAgent({id,name,capabilities=[],policy='approval-required',metadata={}}={}) {
  if(!id||!name) throw new Error('agent id and name are required');
  return {id,name,capabilities:[...new Set(capabilities)],policy,metadata:structuredClone(metadata)};
}
