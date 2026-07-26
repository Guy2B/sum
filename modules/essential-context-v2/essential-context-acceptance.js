(function(g){
  g.SigmaEssentialContextAcceptance={validate(){
    const required=['SigmaContextProfile','SigmaLifeProfileCatalog','SigmaSupportCatalog','SigmaSchoolHousehold','SigmaJobSearchProfile','SigmaResponseAdaptation','SigmaContextRecommendations','SigmaCalendarImport','SigmaCalendarHabitOverlay','SigmaJourney','SigmaLearningInsights','SigmaUTF8Health','SigmaEssentialContextUI'];
    const missing=required.filter(k=>!g[k]);
    return{ok:missing.length===0,missing};
  }};
})(window);
