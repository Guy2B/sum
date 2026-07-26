import {createScenario} from './scenario-schema.mjs';
export function buildEditionScenarios(){
  return ['personal','family','student','job-seeker','creator','freelancer','frontalier','caregiver','small-business'].map((edition,i)=>
    createScenario({id:`edition-${i+1}`,title:`Parcours ${edition}`,edition,steps:[{kind:'receive',input:{edition}},{kind:'decide',input:{edition}},{kind:'approve',input:{edition}}]})
  );
}
