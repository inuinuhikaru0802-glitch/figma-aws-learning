import { S3Client } from '@aws-sdk/client-s3';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { getAwsClientConfig, getCognitoProviderName } from './config';

export function createS3Client(idToken: string): S3Client {
  const { region, identityPoolId, userPoolId } = getAwsClientConfig();
  const providerName = getCognitoProviderName(region, userPoolId);

  const cognitoIdentityClient = new CognitoIdentityClient({ region });

  return new S3Client({
    region,
    credentials: fromCognitoIdentityPool({
      client: cognitoIdentityClient,
      identityPoolId,
      logins: {
        [providerName]: idToken,
      },
    }),
  });
}
