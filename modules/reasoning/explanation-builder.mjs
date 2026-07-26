export function explainDecision({winner,utility,risk,alternatives=[]}={}){
  return {
    summary:`Option ${winner?.id||'unknown'} selected`,
    reasons:[
      `utility=${Number(utility?.score||0).toFixed(3)}`,
      `risk=${Number(risk?.residualRisk||0).toFixed(3)}`,
      `alternatives=${alternatives.length}`
    ],
    winner
  };
}
