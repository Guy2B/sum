(function(g){
  function build(){
    const context=
      window.SigmaContextProfileStore?.get?.() ||
      window.SigmaContextProfileStore?.load?.() ||
      {};
    const life=window.SigmaLifeProfileProposalsV1.suggested(context);
    const support=window.SigmaSupportProfileProposalsV1.suggested(life.map(x=>x.id));
    return{
      lifeProfiles:life,
      supportProfiles:support,
      reason:'Suggestions fondées sur le contexte disponible et les profils généraux recommandés.'
    };
  }
  g.SigmaOnboardingRecommendationEngineV1={build};
})(window);
