(function(g){
  function explain(action){
    const parts=[];
    if(action.priority?.level)parts.push(`Niveau ${action.priority.level}`);
    if(action.priority?.score!=null)parts.push(`score ${action.priority.score}`);
    if(action.reasons?.length)parts.push(action.reasons.join(', '));
    if(action.projectId)parts.push('lié à un projet');
    if(action.contact)parts.push(`contact : ${action.contact}`);
    return parts.length?parts.join(' · '):'Aucune justification disponible';
  }
  g.SigmaActionExplanation={explain};
})(window);
