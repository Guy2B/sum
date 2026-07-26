import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Operations Console product files stay UTF-8 clean', () => {
  for (const path of ['product/operations-console.html', 'product/operations-console.js']) {
    assert.doesNotMatch(fs.readFileSync(path, 'utf8'), /(?:Ã.|Â.|â€|ï¿½|Î£)/);
  }
});
