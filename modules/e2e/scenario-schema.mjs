export function createScenario({id,title,edition='personal',steps=[],expected=[]}={}) {
  if(!id||!title) throw new Error('id and title are required');
  return {id,title,edition,steps,expected,status:'draft',createdAt:new Date().toISOString()};
}
