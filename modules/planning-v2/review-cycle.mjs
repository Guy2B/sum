export function createReviewCycle({
  id,
  cadence='weekly',
  questions=[]
}={}){
  if(!id) throw new Error('review cycle id is required');
  return {
    id,
    cadence,
    questions:questions.length?[...questions]:[
      'What moved forward?',
      'What is blocked?',
      'What should change next?'
    ]
  };
}

export function completeReview(cycle,answers={}){
  return {
    cycleId:cycle.id,
    completedAt:new Date().toISOString(),
    answers:structuredClone(answers),
    unanswered:cycle.questions.filter(question=>answers[question]===undefined)
  };
}
