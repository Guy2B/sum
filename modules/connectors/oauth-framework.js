"use strict";

const crypto = require("node:crypto");

class OAuthConfigurationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "OAuthConfigurationError";
    this.code = "OAUTH_CONFIGURATION_ERROR";
    this.details = details;
  }
}

class OAuthStateError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "OAuthStateError";
    this.code = "OAUTH_STATE_ERROR";
    this.details = details;
  }
}

class OAuthTokenError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "OAuthTokenError";
    this.code = options.code || "OAUTH_TOKEN_ERROR";
    this.retryable = Boolean(options.retryable);
    this.status = options.status || null;
    this.cause = options.cause;
  }
}

function base64Url(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createPkcePair(randomBytes = crypto.randomBytes) {
  const verifier = base64Url(randomBytes(64));
  const challenge = base64Url(
    crypto.createHash("sha256").update(verifier).digest(),
  );

  return {
    verifier,
    challenge,
    method: "S256",
  };
}

function createState(randomBytes = crypto.randomBytes) {
  return base64Url(randomBytes(32));
}

function normalizeScopes(scopes) {
  if (!Array.isArray(scopes) || scopes.length === 0) {
    throw new OAuthConfigurationError("At least one OAuth scope is required.");
  }

  return [...new Set(scopes.map((scope) => String(scope).trim()).filter(Boolean))];
}

function validateProviderConfig(config) {
  if (!config || typeof config !== "object") {
    throw new OAuthConfigurationError("OAuth provider config must be an object.");
  }

  for (const key of ["id", "clientId", "authorizationEndpoint", "tokenEndpoint", "redirectUri"]) {
    if (!config[key] || typeof config[key] !== "string") {
      throw new OAuthConfigurationError(`Missing OAuth provider field: ${key}.`, {
        field: key,
      });
    }
  }

  const normalized = {
    ...config,
    scopes: normalizeScopes(config.scopes),
  };

  return normalized;
}

function createAuthorizationRequest(config, options = {}) {
  const provider = validateProviderConfig(config);
  const state = options.state || createState(options.randomBytes);
  const pkce = options.pkce || createPkcePair(options.randomBytes);

  const url = new URL(provider.authorizationEndpoint);
  url.searchParams.set("client_id", provider.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", provider.redirectUri);
  url.searchParams.set("scope", provider.scopes.join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", pkce.challenge);
  url.searchParams.set("code_challenge_method", pkce.method);

  if (provider.authorizationParams) {
    for (const [key, value] of Object.entries(provider.authorizationParams)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return {
    url: url.toString(),
    state,
    verifier: pkce.verifier,
    providerId: provider.id,
    createdAt: new Date().toISOString(),
  };
}

function validateAuthorizationCallback(callbackUrl, expectedState) {
  const url = new URL(callbackUrl);
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    throw new OAuthStateError(
      errorDescription || `OAuth provider returned ${error}.`,
      { error },
    );
  }

  const state = url.searchParams.get("state");
  if (!state || state !== expectedState) {
    throw new OAuthStateError("OAuth state validation failed.");
  }

  const code = url.searchParams.get("code");
  if (!code) {
    throw new OAuthStateError("OAuth callback does not contain an authorization code.");
  }

  return { code, state };
}

function normalizeTokenResponse(payload, now = Date.now()) {
  if (!payload || typeof payload !== "object" || !payload.access_token) {
    throw new OAuthTokenError("OAuth token response is missing access_token.");
  }

  const expiresIn = Math.max(0, Number(payload.expires_in || 0));
  const expiresAt = expiresIn ? now + expiresIn * 1000 : null;

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || null,
    tokenType: payload.token_type || "Bearer",
    scope: payload.scope || null,
    expiresAt,
    raw: payload,
  };
}

function tokenNeedsRefresh(token, options = {}) {
  if (!token || !token.accessToken) return true;
  if (!token.expiresAt) return false;

  const now = options.now ?? Date.now();
  const skewMs = options.skewMs ?? 60_000;
  return token.expiresAt <= now + skewMs;
}

function normalizeTokenError(error) {
  if (error instanceof OAuthTokenError) return error;

  const status = Number(error?.status || error?.statusCode || 0) || null;
  const code = String(error?.code || "OAUTH_TOKEN_ERROR");
  const retryable =
    status === 408 ||
    status === 429 ||
    (status !== null && status >= 500) ||
    ["ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"].includes(code);

  return new OAuthTokenError(
    error?.message || "OAuth token operation failed.",
    {
      code,
      retryable,
      status,
      cause: error,
    },
  );
}

class OAuthTokenStore {
  #records = new Map();

  async get(key) {
    return this.#records.get(key) || null;
  }

  async set(key, token) {
    this.#records.set(key, token);
    return token;
  }

  async delete(key) {
    return this.#records.delete(key);
  }
}

class OAuthClient {
  #config;
  #transport;
  #store;
  #clock;

  constructor({ config, transport, store = new OAuthTokenStore(), clock = () => Date.now() }) {
    this.#config = validateProviderConfig(config);

    if (!transport || typeof transport.postForm !== "function") {
      throw new OAuthConfigurationError(
        "OAuth transport must implement postForm(url, body).",
      );
    }

    this.#transport = transport;
    this.#store = store;
    this.#clock = clock;
  }

  createAuthorizationRequest(options = {}) {
    return createAuthorizationRequest(this.#config, options);
  }

  async exchangeCode({ code, verifier, accountId = "default" }) {
    return this.#requestToken(
      {
        grant_type: "authorization_code",
        client_id: this.#config.clientId,
        code,
        code_verifier: verifier,
        redirect_uri: this.#config.redirectUri,
      },
      accountId,
    );
  }

  async refresh({ refreshToken, accountId = "default" }) {
    if (!refreshToken) {
      throw new OAuthTokenError("A refresh token is required.");
    }

    return this.#requestToken(
      {
        grant_type: "refresh_token",
        client_id: this.#config.clientId,
        refresh_token: refreshToken,
        scope: this.#config.scopes.join(" "),
      },
      accountId,
    );
  }

  async getValidToken(accountId = "default") {
    const key = this.#key(accountId);
    const current = await this.#store.get(key);

    if (!current) return null;
    if (!tokenNeedsRefresh(current, { now: this.#clock() })) return current;
    if (!current.refreshToken) return null;

    return this.refresh({
      refreshToken: current.refreshToken,
      accountId,
    });
  }

  async revoke(accountId = "default") {
    return this.#store.delete(this.#key(accountId));
  }

  async #requestToken(body, accountId) {
    try {
      const response = await this.#transport.postForm(
        this.#config.tokenEndpoint,
        body,
      );

      const token = normalizeTokenResponse(response, this.#clock());
      const key = this.#key(accountId);
      const existing = await this.#store.get(key);

      if (!token.refreshToken && existing?.refreshToken) {
        token.refreshToken = existing.refreshToken;
      }

      await this.#store.set(key, token);
      return token;
    } catch (error) {
      throw normalizeTokenError(error);
    }
  }

  #key(accountId) {
    return `${this.#config.id}:${accountId}`;
  }
}

module.exports = {
  OAuthConfigurationError,
  OAuthStateError,
  OAuthTokenError,
  OAuthTokenStore,
  OAuthClient,
  base64Url,
  createPkcePair,
  createState,
  normalizeScopes,
  validateProviderConfig,
  createAuthorizationRequest,
  validateAuthorizationCallback,
  normalizeTokenResponse,
  tokenNeedsRefresh,
  normalizeTokenError,
};
