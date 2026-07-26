import {normalizeFeedback} from './feedback-normalizer.mjs';
import {createPreferenceProfile} from './preference-profile.mjs';
import {createBehaviorModel} from './behavior-model.mjs';
import {createLearningAudit} from './learning-audit.mjs';
import {evaluateLearningPolicy} from './learning-policy.mjs';

export function createLearningOrchestrator({policy={}}={}){
  const profiles=new Map();
  const behaviors=new Map();
  const audit=createLearningAudit();

  function profileFor(subjectId){
    if(!profiles.has(subjectId)) profiles.set(subjectId,createPreferenceProfile({subjectId}));
    return profiles.get(subjectId);
  }

  function behaviorFor(subjectId){
    if(!behaviors.has(subjectId)) behaviors.set(subjectId,createBehaviorModel());
    return behaviors.get(subjectId);
  }

  return {
    ingest(event){
      const decision=evaluateLearningPolicy(event,policy);
      audit.record({
        type:'learning-event-evaluated',
        eventId:event.id,
        subjectId:event.subjectId,
        accepted:decision.accepted
      });
      if(!decision.accepted) return decision;

      if(event.subjectId){
        behaviorFor(event.subjectId).observe(event.type);
      }

      if(event.type==='feedback'&&event.subjectId){
        const feedback=normalizeFeedback(event.payload);
        if(feedback.correctedLabel){
          profileFor(event.subjectId).set(`label:${feedback.signalId}`,feedback.correctedLabel);
        }
        if(feedback.rating!==null){
          profileFor(event.subjectId).set('lastRating',feedback.rating);
        }
      }

      return {accepted:true};
    },

    profile(subjectId){
      return profileFor(subjectId).snapshot();
    },

    behavior(subjectId){
      return behaviorFor(subjectId).snapshot();
    },

    audit(filters={}){
      return audit.list(filters);
    }
  };
}
