import {
  AUTH_STORAGE_KEYS,
  CLIENT_ID,
  COGNITO_DOMAIN,
  LOGOUT_URI,
  REDIRECT_URI,
  RESPONSE_TYPE,
  SCOPES,
} from './config';
import { generateCodeChallenge, generateCodeVerifier, generateOAuthState } from './pkce';

type StoredTokens = {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

export type AuthUser = {
  email?: string;
  name?: string;
};

export type AuthSession = StoredTokens & {
  user: AuthUser | null;
};

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

type AuthInitializationResult = {
  session: AuthSession | null;
  notice: string | null;
};

type TokenResponse = {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
}

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function decodeJwtPayload<T>(token: string): T | null {
  const payload = token.split('.')[1];
  if (!payload) {
    return null;
  }

  try {
    const binary = decodeBase64Url(payload);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function buildSession(tokens: StoredTokens): AuthSession {
  const claims = decodeJwtPayload<Record<string, unknown>>(tokens.idToken);

  return {
    ...tokens,
    user: {
      email: typeof claims?.email === 'string' ? claims.email : undefined,
      name:
        typeof claims?.name === 'string'
          ? claims.name
          : typeof claims?.['cognito:username'] === 'string'
            ? claims['cognito:username']
            : undefined,
    },
  };
}

function storeTokens(tokens: StoredTokens): void {
  const storage = getStorage();
  storage?.setItem(AUTH_STORAGE_KEYS.tokens, JSON.stringify(tokens));
}

function readStoredTokens(): StoredTokens | null {
  const storage = getStorage();
  const stored = parseJson<StoredTokens>(storage?.getItem(AUTH_STORAGE_KEYS.tokens) ?? null);

  if (!stored) {
    return null;
  }

  if (stored.expiresAt && stored.expiresAt <= Date.now()) {
    clearAuthStorage();
    return null;
  }

  return stored;
}

function saveTransientAuth(state: string, verifier: string): void {
  const storage = getStorage();
  storage?.setItem(AUTH_STORAGE_KEYS.oauthState, state);
  storage?.setItem(AUTH_STORAGE_KEYS.pkceVerifier, verifier);
}

function readTransientAuth(): { state: string | null; verifier: string | null } {
  const storage = getStorage();

  return {
    state: storage?.getItem(AUTH_STORAGE_KEYS.oauthState) ?? null,
    verifier: storage?.getItem(AUTH_STORAGE_KEYS.pkceVerifier) ?? null,
  };
}

function clearTransientAuth(): void {
  const storage = getStorage();
  storage?.removeItem(AUTH_STORAGE_KEYS.oauthState);
  storage?.removeItem(AUTH_STORAGE_KEYS.pkceVerifier);
}

function markSignedOut(): void {
  const storage = getStorage();
  storage?.setItem(AUTH_STORAGE_KEYS.signedOut, 'true');
}

function consumeSignedOutNotice(): string | null {
  const storage = getStorage();

  if (storage?.getItem(AUTH_STORAGE_KEYS.signedOut) === 'true') {
    storage.removeItem(AUTH_STORAGE_KEYS.signedOut);
    return 'You have been signed out.';
  }

  return null;
}

function clearUrlQuery(): void {
  const cleanedPath = `${window.location.pathname}${window.location.hash}`;
  window.history.replaceState({}, '', cleanedPath || '/');
}

async function exchangeAuthorizationCode(code: string, verifier: string): Promise<StoredTokens> {
  const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }).toString(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AuthError(`Token endpoint failed: ${response.status} ${body || response.statusText}`);
  }

  const payload = (await response.json()) as TokenResponse;

  return {
    accessToken: payload.access_token,
    idToken: payload.id_token,
    refreshToken: payload.refresh_token,
    expiresAt: payload.expires_in ? Date.now() + payload.expires_in * 1000 : undefined,
  };
}

async function handleAuthorizationCallback(searchParams: URLSearchParams): Promise<AuthSession> {
  const returnedState = searchParams.get('state');
  const authorizationCode = searchParams.get('code');

  if (!authorizationCode) {
    throw new AuthError('Authorization code is missing from the callback URL.');
  }

  const { state: expectedState, verifier } = readTransientAuth();

  if (!returnedState || !expectedState || returnedState !== expectedState) {
    clearTransientAuth();
    throw new AuthError('Authentication failed because the returned state did not match.');
  }

  if (!verifier) {
    clearTransientAuth();
    throw new AuthError('Authentication failed because the PKCE verifier was not found.');
  }

  const tokens = await exchangeAuthorizationCode(authorizationCode, verifier);
  storeTokens(tokens);
  clearTransientAuth();
  clearUrlQuery();

  return buildSession(tokens);
}

export function clearAuthStorage(): void {
  const storage = getStorage();
  storage?.removeItem(AUTH_STORAGE_KEYS.tokens);
  clearTransientAuth();
}

export async function startLogin(): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateOAuthState();
  saveTransientAuth(state, verifier);

  const authorizeUrl = new URL(`${COGNITO_DOMAIN}/oauth2/authorize`);
  authorizeUrl.searchParams.set('client_id', CLIENT_ID);
  authorizeUrl.searchParams.set('response_type', RESPONSE_TYPE);
  authorizeUrl.searchParams.set('scope', SCOPES);
  authorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');
  authorizeUrl.searchParams.set('code_challenge', challenge);
  authorizeUrl.searchParams.set('state', state);

  window.location.assign(authorizeUrl.toString());
}

export function startLogout(): void {
  clearAuthStorage();
  markSignedOut();

  const logoutUrl = new URL(`${COGNITO_DOMAIN}/logout`);
  logoutUrl.searchParams.set('client_id', CLIENT_ID);
  logoutUrl.searchParams.set('logout_uri', LOGOUT_URI);

  window.location.assign(logoutUrl.toString());
}

export async function initializeAuth(): Promise<AuthInitializationResult> {
  const notice = consumeSignedOutNotice();
  const searchParams = new URLSearchParams(window.location.search);
  const oauthError = searchParams.get('error');

  if (oauthError) {
    const description = searchParams.get('error_description');
    clearUrlQuery();
    throw new AuthError(description || `Authentication failed: ${oauthError}`);
  }

  if (searchParams.has('code')) {
    const session = await handleAuthorizationCallback(searchParams);
    return { session, notice };
  }

  const storedTokens = readStoredTokens();

  if (!storedTokens) {
    return { session: null, notice };
  }

  return { session: buildSession(storedTokens), notice };
}
