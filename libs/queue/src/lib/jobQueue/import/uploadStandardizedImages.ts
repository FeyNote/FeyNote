import {
  proxyGetRequest,
  transformAndUploadFileToS3ForUser,
} from '@feynote/api-services';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import pLimit from 'p-limit';
import { basename, extname } from 'path';
import { FilePurpose } from '@prisma/client';
import { Readable } from 'stream';
import { createReadStream } from 'fs';

const ALLOWED_NUMBER_OF_HTTP_LINKS_PER_UPLOAD = 5000;
const UPLOAD_CONCURRENCY = 20;

const limit = pLimit(UPLOAD_CONCURRENCY);

export const uploadStandardizedImages = async (
  userId: string,
  importInfo: StandardizedImportInfo,
) => {
  let counter = 0;
  const results = await Promise.allSettled(
    importInfo.imageFilesToUpload.map(async (imageInfo) => {
      return limit(async () => {
        counter++;

        if (counter > ALLOWED_NUMBER_OF_HTTP_LINKS_PER_UPLOAD) {
          throw new Error('Too many http links');
        }

        let fileName: string;
        let file = new Readable();
        if ('url' in imageInfo) {
          const response = await proxyGetRequest(imageInfo.url, {
            responseType: 'stream',
          });

          file = response.data;
          fileName = basename(imageInfo.url, extname(imageInfo.url));
        } else {
          console.log('Recieved Image Info:', JSON.stringify(imageInfo) + '\n');
          fileName = basename(imageInfo.path, extname(imageInfo.path));
          file = createReadStream(imageInfo.path);
        }

        const purpose = FilePurpose.artifact;
        const mimetype = 'image/jpeg';
        const uploadResult = await transformAndUploadFileToS3ForUser({
          userId,
          file: file,
          purpose,
          mimetype,
        });

        const fileData = {
          id: imageInfo.id,
          artifactId: imageInfo.associatedArtifactId,
          userId,
          name: fileName,
          mimetype,
          storageKey: uploadResult.key,
          purpose,
          metadata: {
            uploadResult,
          },
        };

        return fileData;
      });
    }),
  );

  const uploadedFiles = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
  return uploadedFiles;
};
