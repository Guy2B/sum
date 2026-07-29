"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  OAuthConfigurationError,
  OAuthStateError,
  OAuthTokenError,
  OAuthTokenStore,
  OAuthClient,
  createPkcePair,
  createAuthorizationRequest,
  validateAuthorizationCallback,
  normalizeTokenResponse,
  tokenNeedsRefresh,
} = require("../../modules/connectors/oauth-framework.js");

const provider = {
  id: "microsoft",
  clientId: "sigma-client",
  authorizationEndpoint: "https://login.example.test/authorize",
  tokenEndpoint: "https://login.example.test/token",
  redirectUri: "https://sigma.example.test/oauth/callback",
  scopes: ["openid", "offline_access", "Mail.Read"],
};

test("Sprint 77 PKCE creates an S256 verifier and challenge", () => {
  const randomBytes = () => Buffer.alloc(64, 7);
  const pair = createPkcePair(randomBytes);

  assert.equal(pair.method, "S256");
  assert.ok(pair.verifier.length >= 43);
  assert.ok(pair.challenge.length >= 43);
  assert.notEqual(pair.verifier, pair.challenge);
});

test("Sprint 77 authorization request includes state, scopes and PKCE", () => {
  const request = createAuthorizationRequest(provider, {
    state: "state-123",
    pkce: {
      verifier: "verifier-123",
      challenge: "challenge-123",
      method: "S256",
    },
  });

  const url = new URL(request.url);
  assert.equal(url.searchParams.get("client_id"), "sigma-client");
  assert.equal(url.searchParams.get("state"), "state-123");
  assert.equal(url.searchParams.get("code_challenge"), "challenge-123");
  assert.equal(url.searchParams.get("scope"), "openid offline_access Mail.Read");
  assert.equal(request.verifier, "verifier-123");
});

test("Sprint 77 callback validation rejects state mismatch", () => {
  assert.throws(
    () =>
      validateAuthorizationCallback(
        "https://sigma.example.test/oauth/callback?code=abc&state=wrong",
        "expected",
      ),
    OAuthStateError,
  );
});

test("Sprint 77 token response normalizes expiry", () => {
  const token = normalizeTokenResponse(
    {
      access_token: "access",
      refresh_token: "refresh",
      expires_in: 3600,
      token_type: "Bearer",
    },
    1_000,
  );

  assert.equal(token.accessToken, "access");
  assert.equal(token.refreshToken, "refresh");
  assert.equal(token.expiresAt, 3_601_000);
});

test("Sprint 77 token refresh threshold is configurable", () => {
  const token = { accessToken: "access", expiresAt: 100_000 };

  assert.equal(tokenNeedsRefresh(token, { now: 30_000, skewMs: 60_000 }), false);
  assert.equal(tokenNeedsRefresh(token, { now: 40_001, skewMs: 60_000 }), true);
});

test("Sprint 77 OAuth client exchanges and stores tokens", async () => {
  const calls = [];
  const store = new OAuthTokenStore();
  const client = new OAuthClient({
    config: provider,
    store,
    clock: () => 10_000,
    transport: {
      async postForm(url, body) {
        calls.push({ url, body });
        return {
          access_token: "access-1",
          refresh_token: "refresh-1",
          expires_in: 3600,
        };
      },
    },
  });

  const token = await client.exchangeCode({
    code: "authorization-code",
    verifier: "verifier",
    accountId: "person@example.test",
  });

  assert.equal(token.accessToken, "access-1");
  assert.equal(calls[0].body.grant_type, "authorization_code");
  assert.equal(
    (await store.get("microsoft:person@example.test")).refreshToken,
    "refresh-1",
  );
});

test("Sprint 77 refresh preserves previous refresh token when omitted", async () => {
  const store = new OAuthTokenStore();
  await store.set("microsoft:default", {
    accessToken: "old-access",
    refreshToken: "stable-refresh",
    expiresAt: 1,
  });

  const client = new OAuthClient({
    config: provider,
    store,
    clock: () => 20_000,
    transport: {
      async postForm() {
        return {
          access_token: "new-access",
          expires_in: 3600,
        };
      },
    },
  });

  const token = await client.getValidToken();
  assert.equal(token.accessToken, "new-access");
  assert.equal(token.refreshToken, "stable-refresh");
});

test("Sprint 77 temporary token errors are marked retryable", async () => {
  const client = new OAuthClient({
    config: provider,
    transport: {
      async postForm() {
        const error = new Error("Rate limited.");
        error.status = 429;
        error.code = "THROTTLED";
        throw error;
      },
    },
  });

  await assert.rejects(
    () =>
      client.exchangeCode({
        code: "code",
        verifier: "verifier",
      }),
    (error) => {
      assert.equal(error instanceof OAuthTokenError, true);
      assert.equal(error.retryable, true);
      assert.equal(error.code, "THROTTLED");
      return true;
    },
  );
});

test("Sprint 77 invalid provider configuration is rejected", () => {
  assert.throws(
    () =>
      new OAuthClient({
        config: { id: "broken" },
        transport: { async postForm() {} },
      }),
    OAuthConfigurationError,
  );
});
