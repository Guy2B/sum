export function createIdentityContext({
  subjectId,
  roles=[],
  attributes={},
  authenticationLevel='standard'
}={}){
  if(!subjectId) throw new Error('subjectId is required');
  return {
    subjectId,
    roles:[...new Set(roles)],
    attributes:structuredClone(attributes),
    authenticationLevel
  };
}
