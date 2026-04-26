import { CognitoIdentityClient, GetIdCommand } from '@aws-sdk/client-cognito-identity';
import { getAwsClientConfig, getCognitoProviderName } from './config';

export async function getIdentityId(idToken: string): Promise<string> {
  const { region, identityPoolId, userPoolId } = getAwsClientConfig();
  const providerName = getCognitoProviderName(region, userPoolId);

  const client = new CognitoIdentityClient({ region });
  const command = new GetIdCommand({
    IdentityPoolId: identityPoolId,
    Logins: {
      [providerName]: idToken,
    },
  });

  const response = await client.send(command);
  if (!response.IdentityId) {
    throw new Error('Failed to retrieve Cognito IdentityId.');
  }

  return response.IdentityId;
}
