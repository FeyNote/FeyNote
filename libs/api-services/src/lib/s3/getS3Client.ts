import { S3Client } from '@aws-sdk/client-s3';
import { globalServerConfig } from '@feynote/config';

let s3Client: S3Client | undefined;

export const getS3Client = () =>
  (s3Client ??= new S3Client({
    region: globalServerConfig.aws.region,
    credentials: {
      accessKeyId: globalServerConfig.aws.accessKeyId,
      secretAccessKey: globalServerConfig.aws.secretAccessKey,
    },
    requestHandler: {
      requestInit() {
        return {
          foo: 'bar',
        };
      },
    },
  }));
