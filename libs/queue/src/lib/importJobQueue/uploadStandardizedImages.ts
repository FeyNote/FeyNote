import { convertImageForStorage, proxyGetRequest, uploadFileToS3 } from "@feynote/api-services";
import type { StandardizedImportInfo } from "./StandardizedImportInfo";
import pLimit from 'p-limit';
import { Transform } from "stream";
import { basename, extname } from "path";
import { FilePurpose } from "@prisma/client";

const ALLOWED_NUMBER_OF_HTTP_LINKS_PER_UPLOAD = 5000
const UPLOAD_CONCURRENCY = 20;

const limit = pLimit(UPLOAD_CONCURRENCY);

export const uploadStandardizedImages = async (
  userId: string,
  importInfo: StandardizedImportInfo,
) => {
  let counter = 0;
  const results = await Promise.allSettled(importInfo.imageFilesToUpload.map(async (imageInfo) => {
    return limit(async () => {
      counter++;

      if (counter > ALLOWED_NUMBER_OF_HTTP_LINKS_PER_UPLOAD) {
        throw new Error('Too many http links');
      }

      let buffer, fileName;
      if ("url" in imageInfo) {
        const response = await proxyGetRequest(imageInfo.url, { responseType: 'stream' });
        const stream = response.data

        let totalSize = 0;
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

        const fileSizeLimiter = new Transform({
          transform(chunk, _, callback) {
            totalSize += chunk.length;
            if (totalSize > MAX_FILE_SIZE) {
              console.log(`totalSize: ${totalSize}`);
              callback(new Error('File size limit exceeded'));
            } else {
              callback(null, chunk);
            }
          }
        });

        const chunks: Uint8Array[] = [];
        await new Promise<void>((resolve, reject) => {
          stream
            .pipe(fileSizeLimiter)
            .on('data', (chunk: Uint8Array) => {
              chunks.push(chunk);
            })
            .on('error', (err: unknown) => {
              console.error('Stream error:', (err as Error).message);
              reject();
            })
            .on('finish', () => {
              console.log('File successfully written');
              resolve();
            });
        });

        buffer = await convertImageForStorage(userId, Buffer.concat(chunks));
        fileName = basename(imageInfo.url, extname(imageInfo.url));
      } else {
        // TODO: verify path exists
        buffer = await convertImageForStorage(userId, imageInfo.path);
        fileName = basename(imageInfo.path, extname(imageInfo.path));
      }

      const purpose = FilePurpose.artifact;
      const mimetype = 'image/jpeg';
      const uploadResult = await uploadFileToS3(buffer, mimetype, purpose);

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
    })
  }));

  const uploadedFiles = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
  return uploadedFiles;
}
