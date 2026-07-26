export function createRankingTrainer({learningRate=0.1}={}){
  const weights=new Map();
  return {
    predict(features={}){
      return Object.entries(features).reduce((score,[key,value])=>{
        if(typeof value!=='number') return score;
        return score+(weights.get(key)||0)*value;
      },0);
    },
    update(features={},target=0){
      const prediction=this.predict(features);
      const error=target-prediction;
      for(const [key,value] of Object.entries(features)){
        if(typeof value!=='number') continue;
        weights.set(key,(weights.get(key)||0)+(learningRate*error*value));
      }
      return {prediction,error,weights:Object.fromEntries(weights)};
    },
    weights(){return Object.fromEntries(weights);}
  };
}
