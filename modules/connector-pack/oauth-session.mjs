export function createOAuthSession({
  provider,
  state,
  scopes = [],
  redirectUri,
  codeVerifierRef = null,
} = {}) {
  if (!provider || !state || !redirectUri) throw new Error('provider, state and redirectUri are required');
  return {
    provider,
    state,
    scopes: [...new Set(scopes)],
    redirectUri,
    codeVerifierRef,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

export function completeOAuthSession(session, {
  returnedState,
  credentialRef,
  expiresAt = null,
} = {}) {
  if (returnedState !== session.state) throw new Error('OAuth state mismatch');
  if (!/^vault:|^env:|^keychain:/i.test(String(credentialRef || ''))) {
    throw new Error('credentialRef must reference a secure store');
  }
  return {
    ...session,
    status: 'connected',
    credentialRef,
    expiresAt,
    connectedAt: new Date().toISOString(),
  };
}
