import {createMetricRegistry} from './metric-registry.mjs';
import {createLogBuffer} from './log-buffer.mjs';
import {createHealthProbe} from './health-probe.mjs';
import {createIncidentManager} from './incident-manager.mjs';
import {evaluateAlertRule} from './alert-rule.mjs';

export function createObservabilityOrchestrator(){
  const metrics=createMetricRegistry();
  const logs=createLogBuffer();
  const health=createHealthProbe();
  const incidents=createIncidentManager();
  const alertRules=[];

  return {
    metrics,
    logs,
    health,
    incidents,

    registerAlert(rule){
      if(!rule?.id) throw new Error('alert rule id is required');
      alertRules.push(structuredClone(rule));
      return rule.id;
    },

    ingest(event){
      logs.write({
        level:event.severity||'info',
        source:event.source,
        traceId:event.attributes?.traceId||null,
        eventType:event.type,
        message:event.attributes?.message||event.type
      });

      for(const [name,value] of Object.entries(event.measurements||{})){
        if(typeof value==='number') metrics.observe(`${event.source}.${name}`,value);
      }

      return {accepted:true,eventId:event.id};
    },

    evaluateAlerts(context={}){
      return alertRules
        .map(rule=>evaluateAlertRule(rule,context))
        .filter(result=>result.triggered);
    },

    async snapshot(){
      return {
        health:await health.run(),
        metrics:metrics.list(),
        incidents:incidents.list(),
        recentLogs:logs.query({limit:50})
      };
    }
  };
}
