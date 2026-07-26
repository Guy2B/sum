import {createServiceRegistry} from './service-registry.mjs';
import {resolveConfiguration} from './config-resolver.mjs';
import {planDeployment} from './deployment-strategy.mjs';
import {observePlatform} from './platform-observer.mjs';

export function createProductionPlatform(){
  const registry=createServiceRegistry();
  const deployments=[];
  const incidents=[];
  return {
    register(service){return registry.register(service);},
    configure(input){return resolveConfiguration(input);},
    deploy(units,options){
      const plan=planDeployment(units,options);
      deployments.push(...units.map(x=>structuredClone(x)));
      return plan;
    },
    recordIncident(incident){incidents.push(structuredClone(incident));},
    status(){return observePlatform({services:registry.list(),deployments,incidents});}
  };
}
