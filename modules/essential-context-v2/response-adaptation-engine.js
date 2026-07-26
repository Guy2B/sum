(function(g){
  function buildGuidance(context){
    const profiles=context.lifeProfiles||[];
    const supports=context.activeSupports||[];
    const prefs=context.responsePreferences||{};
    const guidance={
      tone:prefs.tone||'balanced',
      depth:prefs.depth||'guided',
      format:prefs.format||'structured',
      audience:'adult',
      priorities:[],
      cautions:[]
    };
    if(profiles.includes('parent')){guidance.priorities.push('respecter les contraintes familiales');guidance.cautions.push('éviter de surcharger le foyer');}
    if(profiles.includes('student'))guidance.priorities.push('expliquer progressivement et vérifier la compréhension');
    if(profiles.includes('job-seeker')){guidance.priorities.push('proposer des prochaines étapes concrètes');guidance.cautions.push('préserver la confidentialité de la recherche');}
    if(supports.some(x=>x.startsWith('school-')||['homework','exam-prep','orientation'].includes(x)))guidance.audience='family-education';
    if(supports.some(x=>['job-search','career-change','cv-cover-letter','interview-prep','application-tracking'].includes(x)))guidance.audience='career-transition';
    return guidance;
  }
  function promptPrefix(context){
    const g=buildGuidance(context);
    return `Ton: ${g.tone}. Profondeur: ${g.depth}. Format: ${g.format}. Public: ${g.audience}. Priorités: ${g.priorities.join('; ')||'aucune'}. Vigilances: ${g.cautions.join('; ')||'aucune'}.`;
  }
  g.SigmaResponseAdaptation={buildGuidance,promptPrefix};
})(window);
