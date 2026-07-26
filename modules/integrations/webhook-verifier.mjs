import crypto from 'node:crypto';
export function verifyWebhook({payload,signature,secret,algorithm='sha256'}={}) {
  const expected=crypto.createHmac(algorithm,secret).update(payload).digest('hex');
  const a=Buffer.from(String(signature));
  const b=Buffer.from(expected);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
