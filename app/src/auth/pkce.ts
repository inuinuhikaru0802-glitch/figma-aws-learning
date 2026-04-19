const PKCE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function randomString(length: number): string {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  return Array.from(randomBytes, (byte) => PKCE_CHARSET[byte % PKCE_CHARSET.length]).join('');
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function generateCodeVerifier(): string {
  return randomString(64);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const verifierBytes = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', verifierBytes);
  return toBase64Url(new Uint8Array(digest));
}

export function generateOAuthState(): string {
  return randomString(32);
}
