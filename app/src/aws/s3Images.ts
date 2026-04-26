import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getAwsClientConfig } from './config';
import { getIdentityId } from './cognitoIdentity';
import { createS3Client } from './s3Client';

export async function uploadImageTextFile(idToken: string, file: File): Promise<string> {
  const { bucketName } = getAwsClientConfig();
  const identityId = await getIdentityId(idToken);
  const key = `uploads/${identityId}/${file.name}`;
  const body = new Uint8Array(await file.arrayBuffer());

  const s3Client = createS3Client(idToken);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: file.type || 'text/plain',
      ContentLength: body.byteLength,
    }),
  );

  return key;
}
