import test from 'node:test';import assert from 'node:assert/strict';
import { explainRecommendation } from '../../modules/decision/explanation-engine.mjs';
test('Sprint 115 explains recommendation and alternative',()=>{const ranked=[{option:{label:'Agir'},outcome:{benefit:.8,risk:.2,effortMinutes:20,confidence:.8},tradeoff:{score:80,components:{benefit:80,risk:20}}},{option:{label:'Planifier'},tradeoff:{score:60}}];const e=explainRecommendation({recommended:ranked[0],ranked,context:{}});assert.match(e.headline,/Agir/);assert.match(e.whyNotAlternative,/60/);});
