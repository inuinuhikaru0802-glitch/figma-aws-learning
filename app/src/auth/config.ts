export const COGNITO_DOMAIN = 'https://ap-southeast-2wdpvdclzy.auth.ap-southeast-2.amazoncognito.com';
export const CLIENT_ID = '65509aqudhmv1hulsla062mlp1';
export const REDIRECT_URI = 'https://dudcv9ewgofmx.cloudfront.net/';
export const LOGOUT_URI = 'https://dudcv9ewgofmx.cloudfront.net/';
export const RESPONSE_TYPE = 'code';
export const SCOPES = 'openid email profile';

export const AUTH_STORAGE_KEYS = {
  tokens: 'cognito.auth.tokens',
  pkceVerifier: 'cognito.auth.pkce_verifier',
  oauthState: 'cognito.auth.oauth_state',
  signedOut: 'cognito.auth.signed_out',
} as const;
