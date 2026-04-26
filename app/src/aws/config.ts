type AwsClientConfig = {
  region: string;
  userPoolId: string;
  identityPoolId: string;
  bucketName: string;
};

function requireEnv(name: string): string {
  const value = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getAwsClientConfig(): AwsClientConfig {
  return {
    region: requireEnv('VITE_AWS_REGION'),
    userPoolId: requireEnv('VITE_COGNITO_USER_POOL_ID'),
    identityPoolId: requireEnv('VITE_COGNITO_IDENTITY_POOL_ID'),
    bucketName: requireEnv('VITE_S3_BUCKET_NAME'),
  };
}

export function getCognitoProviderName(region: string, userPoolId: string): string {
  return `cognito-idp.${region}.amazonaws.com/${userPoolId}`;
}
