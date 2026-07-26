import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('Connector Center product files stay UTF-8 clean',()=>{for(const path of ['product/connector-center.html','product/connector-center.js']){const text=fs.readFileSync(path,'utf8');assert.doesNotMatch(text,/(?:Ã.|Â.|â€|ï¿½|Î£)/);}});
