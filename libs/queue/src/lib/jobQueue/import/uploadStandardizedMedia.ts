import {
  logger,
  proxyGetRequest,
  transformAndUploadFileToS3ForUser,
} from '@feynote/api-services';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import pLimit from 'p-limit';
import { basename, extname } from 'path';
import { FilePurpose, type Prisma } from '@prisma/client';
import { Readable } from 'stream';
import { createReadStream } from 'fs';
import mime from 'mime';
import type { JobProgressTracker } from '../JobProgressTracker';

const ALLOWED_NUMBER_OF_HTTP_LINKS_PER_UPLOAD = 5000;
const UPLOAD_CONCURRENCY = 3;
const MEDIA_PROCESSING_REQUEST_TIMEOUT = 15000;

export const uploadStandardizedMedia = async (
  userId: string,
  importInfo: StandardizedImportInfo,
  progressTracker: JobProgressTracker,
) => {
  const limit = pLimit(UPLOAD_CONCURRENCY);
  let counter = 0;
  const results = await Promise.allSettled(
    importInfo.mediaFilesToUpload.map(async (mediaInfo, idx) => {
      // eslint-disable-next-line no-async-promise-executor
      return limit(
        () =>
          new Promise<Prisma.FileCreateManyInput>(async (res, rej) => {
            try {
              counter++;

              if (counter > ALLOWED_NUMBER_OF_HTTP_LINKS_PER_UPLOAD) {
                const errorMsg = 'Too many http links';
                logger.info(errorMsg);
                return rej(new Error(errorMsg));
              }

              let fileName: string;
              let ext: string;
              let file = new Readable();

              const abortController = new AbortController();
              const timeout = setTimeout(() => {
                abortController.abort();
                file.destroy();
                const errorMsg = `Request timed out for handling media url from, ${'path' in mediaInfo ? mediaInfo.path : mediaInfo.url}`;
                logger.info(errorMsg);
                return rej(new Error(errorMsg));
              }, MEDIA_PROCESSING_REQUEST_TIMEOUT);

              if ('url' in mediaInfo) {
                logger.debug(`Retrieving media content from ${mediaInfo.url}`);
                const response = await proxyGetRequest({
                  url: mediaInfo.url,
                  config: {
                    responseType: 'stream',
                    signal: abortController.signal,
                  },
                });

                if (abortController.signal.aborted) return;

                file = response.data;
                ext = extname(mediaInfo.url);
                fileName = basename(mediaInfo.url, ext);
              } else {
                logger.debug(
                  `Beinning stream of local stored media content ${mediaInfo.path}`,
                );
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

              if (abortController.signal.aborted) return;
              clearTimeout(timeout);

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

              logger.debug(`Finished uploading media ${fileName}`);
              return res(fileData);
            } catch (e) {
              logger.error(e);
              return rej(e);
            }
          }),
      );
    }),
  );

  const uploadedFiles = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
  return uploadedFiles;
};
