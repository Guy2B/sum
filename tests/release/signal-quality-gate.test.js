import test from 'node:test';
import assert from 'node:assert/strict';
import { signalQualityGate } from '../../modules/release/signal-quality-gate.js';

test('rejects mojibake', () => {
  const mojibake = 'G' + String.fromCharCode(0xC3, 0xA9) + 'rer';

  assert.equal(
    signalQualityGate({
      files: [{ path: 'app.html', content: mojibake }],
      results: []
    }).ok,
    false
  );
});
