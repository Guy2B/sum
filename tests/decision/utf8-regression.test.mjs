import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('Decision Engine product files stay UTF-8 clean',()=>{for(const path of ['product/decision-engine.html','product/decision-engine.js']){const text=fs.readFileSync(path,'utf8');assert.doesNotMatch(text,/(?:Ã.|Â.|â€|ï¿½|Î£)/);}});
