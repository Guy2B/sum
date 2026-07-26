(function(g){
  g.SigmaLifeSupportCoordinationAcceptanceV3={validate(){
    const required=['SigmaHouseholdMembersV3','SigmaSupportPlansV3','SigmaSupportProfilePresetsV3','SigmaSchoolSupportEngineV3','SigmaJobSearchPipelineV3','SigmaApplicationFollowupEngineV3','SigmaCareLoadEngineV3','SigmaWeeklyFamilyBriefV3','SigmaSupportRecommendationEngineV3','SigmaSupportCoordinationUIV3'];
    const missing=required.filter(k=>!g[k]);return{ok:missing.length===0,missing};
  }};
})(window);
