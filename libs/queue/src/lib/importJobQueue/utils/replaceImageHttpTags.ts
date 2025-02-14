import { getImageQuality, proxyGetRequest, uploadFileToS3 } from "@feynote/api-services";
import sharp from 'sharp';
import { basename, extname } from "path";
import { Transform } from "stream";
import { FilePurpose, Prisma } from "@prisma/client";
import pLimit from 'p-limit';
import { randomUUID } from "crypto";

const ALLOWED_NUMBER_OF_HTTP_LINKS_PER_UPLOAD = 5000
const UPLOAD_CONCURRENCY = 20;

const limit = pLimit(UPLOAD_CONCURRENCY);

export const replaceImageHttpTags = async (content: string, userId: string, fileUploadCountRef: { fileUploadCount: number }): Promise<{ updatedContent: string, files: Array<Prisma.FileCreateManyInput>}> => {
  // Returns two elements (the match and the src url) i.e. <img src="file.png" />
  // 1. The full match
  // 2. The src url
  const imgRegex = /<img src="(.*?)".*?\/>/g
  const asyncHttpUploadEvents: ReturnType<typeof _uploadUserImageToS3FromSrc>[] = [];
  for (const matchingGroups of content.matchAll(imgRegex)) {
    const imageSrc = matchingGroups[1];
    if (imageSrc.startsWith('http')) {
      if (fileUploadCountRef.fileUploadCount < ALLOWED_NUMBER_OF_HTTP_LINKS_PER_UPLOAD) {
        fileUploadCountRef.fileUploadCount += 1

        const uploadPromise = limit(() => _uploadUserImageToS3FromSrc(imageSrc, userId, matchingGroups[0]));
        asyncHttpUploadEvents.push(uploadPromise);
        continue
      }
      const replacementHtml = `<a href="${imageSrc}">${imageSrc}</a>`;
      content = content.replace(matchingGroups[0], replacementHtml);
    }
  }

  const results = await Promise.all(asyncHttpUploadEvents);
  const files: Array<Prisma.FileCreateManyInput> = []
  for (const { fileData, stringToReplace, replacementString } of results) {
      if (fileData) files.push(fileData);
      content = content.replace(stringToReplace, replacementString);
  }

  return { updatedContent: content, files };
}

const _uploadUserImageToS3FromSrc = async (httpSrc: string, userId: string, stringToReplace: string) => {
  try {
    const response = await proxyGetRequest(httpSrc);
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

    const { maxResolution, quality } = await getImageQuality(userId);
    const fileBuffer = await sharp(Buffer.concat(chunks))
      .rotate()
      .resize(maxResolution, maxResolution, {
        fit: 'contain',
        withoutEnlargement: true,
      })
      .jpeg({
        quality,
        mozjpeg: true,
      })
      .toBuffer();

    const id = randomUUID();
    const purpose = FilePurpose.artifact;
    const mimetype = 'image/jpeg';
    const name = basename(httpSrc, extname(httpSrc));
    const uploadResult = await uploadFileToS3(fileBuffer, mimetype, purpose);

    const fileData = {
      id,
      userId,
      name,
      mimetype,
      storageKey: uploadResult.key,
      purpose,
      metadata: {
        uploadResult,
      },
    };
    return { fileData, stringToReplace, replacementString: `<img fileId="${fileData.id}" />` };
  } catch (e) {
    return { fileData: null, stringToReplace, replacementString: `<a href="${httpSrc}">${httpSrc}</a>` };
  }
}
