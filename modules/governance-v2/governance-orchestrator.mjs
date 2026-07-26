import {authorize} from './authorization-engine.mjs';
import {classifyData} from './data-classifier.mjs';
import {redactRecord} from './redaction-engine.mjs';
import {createAuditLedger} from './audit-ledger.mjs';

export function createGovernanceOrchestrator({policies=[]}={}){
  const ledger=createAuditLedger();
  const activePolicies=policies.map(policy=>structuredClone(policy));

  return {
    addPolicy(policy){
      activePolicies.push(structuredClone(policy));
      ledger.append({type:'policy-added',policyId:policy.id});
      return policy.id;
    },

    authorize(request){
      const decision=authorize({...request,policies:activePolicies});
      ledger.append({
        type:'authorization',
        subjectId:request.identity?.subjectId||null,
        resource:request.resource,
        action:request.action,
        allowed:decision.allowed,
        policyId:decision.policyId
      });
      return decision;
    },

    protect(record,options={}){
      const classification=classifyData(record,options.rules);
      const protectedRecord=redactRecord(record,classification,options.redaction);
      ledger.append({
        type:'data-protected',
        classification:classification.classification
      });
      return {classification,record:protectedRecord};
    },

    audit(){
      return ledger.list();
    },

    verifyAudit(){
      return ledger.verify();
    }
  };
}
