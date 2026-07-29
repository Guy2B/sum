"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { redactSecrets, retry, CircuitBreaker } = require("../../modules/connectors/connector-runtime-guard.js");

test("redacts nested secrets", () => {
  const result = redactSecrets({accessToken:"x",nested:{password:"y",safe:"z"}});
  assert.equal(result.accessToken,"[REDACTED]");
  assert.equal(result.nested.password,"[REDACTED]");
  assert.equal(result.nested.safe,"z");
});

test("retries retryable errors", async () => {
  let calls=0;
  const result = await retry(async () => {
    calls += 1;
    if (calls < 3) { const e=new Error("temp"); e.retryable=true; throw e; }
    return "ok";
  });
  assert.equal(result,"ok");
  assert.equal(calls,3);
});

test("circuit breaker opens after threshold", async () => {
  const breaker = new CircuitBreaker({failureThreshold:2,clock:()=>100});
  await assert.rejects(()=>breaker.execute(async()=>{throw new Error("x");}));
  await assert.rejects(()=>breaker.execute(async()=>{throw new Error("x");}));
  await assert.rejects(()=>breaker.execute(async()=> "ok"), /circuit is open/);
});
