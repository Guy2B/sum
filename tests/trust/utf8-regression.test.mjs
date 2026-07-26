import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('Trust Center product files stay UTF-8 clean',()=>{for(const p of ['product/trust-center.html','product/trust-center.js'])assert.doesNotMatch(fs.readFileSync(p,'utf8'),/(?:Ã.|Â.|â€|ï¿½|Î£)/);});
