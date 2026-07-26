(function(g){
  g.SigmaLifeJourneyCalendarAcceptanceV3={validate(){
    const required=['SigmaExternalCalendars','SigmaICSNormalizerV3','SigmaExternalEventStoreV3','SigmaCalendarImportWorkflowV3','SigmaAvailabilityEngineV3','SigmaCommitmentConflictEngineV3','SigmaMilestonesV3','SigmaMilestonePresetsV3','SigmaJourneyTimelineV3','SigmaJourneyInsightsV3','SigmaLifeJourneyCalendarUIV3'];
    const missing=required.filter(k=>!g[k]);return{ok:missing.length===0,missing};
  }};
})(window);
