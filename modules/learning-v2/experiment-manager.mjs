export function createExperimentManager(){
  const experiments=new Map();
  return {
    create({id,name,variants=[]}={}){
      if(!id||!name||variants.length<2) throw new Error('experiment id, name and at least two variants are required');
      const experiment={id,name,variants:[...variants],status:'draft',assignments:new Map()};
      experiments.set(id,experiment);
      return {id,name,variants:[...variants],status:'draft'};
    },
    start(id){
      const experiment=experiments.get(id);
      if(!experiment) throw new Error('unknown experiment');
      experiment.status='running';
      return {id,status:'running'};
    },
    assign(id,subjectId){
      const experiment=experiments.get(id);
      if(!experiment||experiment.status!=='running') throw new Error('experiment is not running');
      if(!experiment.assignments.has(subjectId)){
        const index=Math.abs([...subjectId].reduce((sum,char)=>sum+char.charCodeAt(0),0))%experiment.variants.length;
        experiment.assignments.set(subjectId,experiment.variants[index]);
      }
      return experiment.assignments.get(subjectId);
    },
    stop(id){
      const experiment=experiments.get(id);
      if(!experiment) throw new Error('unknown experiment');
      experiment.status='stopped';
      return {id,status:'stopped'};
    }
  };
}
