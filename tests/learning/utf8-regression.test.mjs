import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('Learning Center product files stay UTF-8 clean',()=>{for(const p of ['product/learning-center.html','product/learning-center.js'])assert.doesNotMatch(fs.readFileSync(p,'utf8'),/(?:Ã.|Â.|â€|ï¿½|Î£)/);});
