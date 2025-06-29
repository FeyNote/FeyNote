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
import mime from 'mime';
import type { JobProgressTracker } from '../JobProgressTracker';

const ALLOWED_NUMBER_OF_HTTP_LINKS_PER_UPLOAD = 5000;
const UPLOAD_CONCURRENCY = 3;

const limit = pLimit(UPLOAD_CONCURRENCY);

export const uploadStandardizedMedia = async (
  userId: string,
  importInfo: StandardizedImportInfo,
  progressTracker: JobProgressTracker,
) => {
  let counter = 0;
  const results = await Promise.allSettled(
    importInfo.mediaFilesToUpload.map(async (mediaInfo, idx) => {
      return limit(async () => {
        counter++;

        if (counter > ALLOWED_NUMBER_OF_HTTP_LINKS_PER_UPLOAD) {
          throw new Error('Too many http links');
        }

        let fileName: string;
        let ext: string;
        let file = new Readable();
        if ('url' in mediaInfo) {
          const response = await proxyGetRequest(mediaInfo.url, {
            responseType: 'stream',
          });

          file = response.data;
          ext = extname(mediaInfo.url);
          fileName = basename(mediaInfo.url, ext);
        } else {
          ext = extname(mediaInfo.path);
          fileName = basename(mediaInfo.path, ext);
          file = createReadStream(mediaInfo.path);
        }

        const purpose = FilePurpose.artifact;
        const mimetype = mime.lookup(ext);

        const { uploadResult } = await transformAndUploadFileToS3ForUser({
          userId,
          file,
          purpose,
          mimetype,
          storageKey: mediaInfo.storageKey,
        });

        const fileData = {
          id: mediaInfo.id,
          artifactId: mediaInfo.associatedArtifactId,
          userId,
          name: fileName,
          mimetype,
          storageKey: uploadResult.key,
          purpose,
          metadata: {
            uploadResult,
          },
        };

        progressTracker.onProgress({
          progress: Math.floor(
            (idx / importInfo.mediaFilesToUpload.length) * 100,
          ),
          step: 2,
        });
        return fileData;
      });
    }),
  );

  const uploadedFiles = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
  return uploadedFiles;
};
