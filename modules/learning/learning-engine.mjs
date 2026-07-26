import { createPreferenceProfile, updateAffinity } from './preference-profile.mjs';
import { interpretFeedback } from './feedback-interpreter.mjs';
import { detectPatterns } from './pattern-detector.mjs';
import { calculateCalibration } from './calibration-engine.mjs';
import { recommendTimeWindow } from './timing-model.mjs';
import { inferExplanationDepth } from './explanation-preference.mjs';
import { learnRoutines } from './routine-learner.mjs';

export function runLearningEngine({
  events = [],
  profile = {},
  predictions = [],
} = {}) {
  let nextProfile = createPreferenceProfile(profile);

  for (const event of events) {
    const interpreted = interpretFeedback(event.feedback || {});
    if (event.context?.optionId && interpreted.weight !== 0) {
      nextProfile = updateAffinity(nextProfile, event.context.optionId, interpreted.weight);
    }
  }

  nextProfile.explanationDepth = inferExplanationDepth(events);

  return {
    profile: nextProfile,
    patterns: detectPatterns(events),
    calibration: calculateCalibration(predictions),
    recommendedTimeWindow: recommendTimeWindow(events),
    routines: learnRoutines(events),
    processedEvents: events.length,
  };
}
