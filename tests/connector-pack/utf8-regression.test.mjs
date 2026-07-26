import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('Real connector product files stay UTF-8 clean',()=>{for(const path of ['product/real-connectors.html','product/real-connectors.js']){assert.doesNotMatch(fs.readFileSync(path,'utf8'),/(?:Ã.|Â.|â€|ï¿½|Î£)/);}});
