import {createScenario} from './scenario-schema.mjs';
export function buildGoldenScenarios(){return[
 createScenario({id:'urgent-bill',title:'Facture urgente',steps:[{kind:'receive',input:{title:'Facture demain'}},{kind:'prioritize',input:{}},{kind:'decide',input:{}},{kind:'approve',input:{}}]}),
 createScenario({id:'job-interview',title:'Entretien emploi',edition:'job-seeker',steps:[{kind:'receive',input:{title:'Entretien jeudi'}},{kind:'plan',input:{}},{kind:'approve',input:{}}]}),
 createScenario({id:'family-care',title:'Coordination familiale',edition:'family',steps:[{kind:'receive',input:{title:'Rendez-vous médical'}},{kind:'delegate',input:{}},{kind:'approve',input:{}}]})
];}
