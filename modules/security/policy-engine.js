'use strict';
const RISK={read:1,draft:2,internal_write:3,external_write:5,destructive:8};
function evaluateAction({kind='read',confidence=0,approved=false,scope=[]}={}){const risk=RISK[kind]??10;const reasons=[];if(risk>=5&&!approved)reasons.push('explicit_approval_required');if(confidence<0.6&&kind!=='read')reasons.push('insufficient_confidence');if(!Array.isArray(scope)||scope.length===0)reasons.push('missing_scope');return Object.freeze({allowed:reasons.length===0,risk,reasons:Object.freeze(reasons)});}
module.exports={RISK,evaluateAction};
