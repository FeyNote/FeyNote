import {
  logger,
  proxyGetRequest,
  TimeoutError,
  transformAndUploadFileToS3ForUser,
} from '@feynote/api-services';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import pLimit from 'p-limit';
import { basename, extname } from 'path';
import { FilePurpose } from '@prisma/client';
import { Readable } from 'stream';
import { createReadStream, type ReadStream } from 'fs';
import mime from 'mime';
import type { JobProgressTracker } from '../JobProgressTracker';

const ALLOWED_NUMBER_OF_HTTP_LINKS_PER_UPLOAD = 5000;
const UPLOAD_CONCURRENCY = 3;
const MEDIA_PROCESSING_REQUEST_TIMEOUT = 15000;

class TooManyLinksError extends Error {
  constructor() {
    super();
    this.name = 'TooManyLinksError';
  }
}

export const uploadStandardizedMedia = async (
  userId: string,
  importInfo: StandardizedImportInfo,
  progressTracker: JobProgressTracker,
) => {
  const limit = pLimit(UPLOAD_CONCURRENCY);
  let counter = 0;
  const results = await Promise.allSettled(
    importInfo.mediaFilesToUpload.map(async (mediaInfo, idx) => {
      return limit(async () => {
        try {
          counter++;

          if (counter > ALLOWED_NUMBER_OF_HTTP_LINKS_PER_UPLOAD) {
            throw new TooManyLinksError();
          }

          let fileName: string;
          let ext: string;
          let file: Readable | ReadStream = new Readable();

          const abortController = new AbortController();
          const timeout = setTimeout(() => {
            if (file.closed) return;

            logger.debug(
              `Request timeout on media ${idx + 1}/${importInfo.mediaFilesToUpload.length}`,
            );
            abortController.abort();
            file._destroy(new TimeoutError(), () => {
              // Do nothing
            });
          }, MEDIA_PROCESSING_REQUEST_TIMEOUT);

          if ('url' in mediaInfo) {
            logger.debug(
              `Retrieving media content from ${mediaInfo.url} ${idx + 1}/${importInfo.mediaFilesToUpload.length}`,
            );
            const response = await proxyGetRequest({
              url: mediaInfo.url,
              config: {
                responseType: 'stream',
                signal: abortController.signal,
              },
            });

            file = response.data;
            ext = extname(mediaInfo.url);
            fileName = basename(mediaInfo.url, ext);
          } else {
            logger.debug(
              `Beginning stream of local stored media content ${mediaInfo.path} ${idx + 1}/${importInfo.mediaFilesToUpload.length}`,
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

          if (abortController.signal.aborted) {
            throw new TimeoutError();
          }
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
              ((idx + 1) / importInfo.mediaFilesToUpload.length) * 100,
            ),
            step: 2,
          });

          logger.debug(
            `Finished uploading media ${fileName} ${idx + 1}/${importInfo.mediaFilesToUpload.length}`,
          );
          return fileData;
        } catch (e) {
          if (e instanceof TimeoutError) {
            logger.debug(
              `Media processing timeout hit while processing data from url ${'url' in mediaInfo ? mediaInfo.url : mediaInfo.path}`,
            );
            throw e;
          }
          if (e instanceof TooManyLinksError) {
            logger.debug(
              `Too many http links in import job, skipping media upload`,
            );
            throw e;
          }
          logger.error(e);
          throw e;
        }
      });
    }),
  );

  const uploadedFiles = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
  return uploadedFiles;
};
