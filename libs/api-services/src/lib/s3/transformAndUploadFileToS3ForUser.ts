import { FilePurpose } from '@prisma/client';
import { PassThrough, Readable, Writable } from 'stream';
import { getFileLimitsForUser } from './getFileLimitsForUser';
import { uploadFileToS3 } from './uploadFileToS3';
import { transformImage } from './transformImage';

export class FileSizeLimitError extends Error {
  constructor() {
    super('File size exceeds maximum allowed size');
  }
}

const IMAGE_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/tiff',
  'image/svg+xml',
];

export async function transformAndUploadFileToS3ForUser(args: {
  userId: string;
  file: Readable;
  purpose: FilePurpose;
  mimetype: string;
  storageKey?: string;
}) {
  const fileLimits = await getFileLimitsForUser(args.userId);
  let maxFileSizeMB = fileLimits.maxFileSize;
  if (args.purpose === FilePurpose.job) {
    maxFileSizeMB = 5000 * 1024 * 1024; // 5GB
  }

  let transformedMimetype = args.mimetype;
  const filePipeline = new PassThrough();
  if (IMAGE_FILE_TYPES.includes(args.mimetype)) {
    transformImage(
      args.file,
      filePipeline,
      fileLimits.maxResolution,
      fileLimits.maxResolution,
      fileLimits.quality,
      'inside',
    );
    transformedMimetype = 'image/jpeg';
  } else {
    args.file.pipe(filePipeline);
  }

  return new Promise<{
    uploadResult: Awaited<ReturnType<typeof uploadFileToS3>>;
    transformedMimetype: string;
  }>((resolve, reject) => {
    let totalBytes = 0;
    const limitedFilePipeline = new PassThrough();
    const sizeLimitError = new FileSizeLimitError();

    const limiter = new Writable({
      write(chunk, _enc, cb) {
        totalBytes += chunk.length;
        if (totalBytes > maxFileSizeMB) {
          cb(sizeLimitError);
          filePipeline.destroy(sizeLimitError); // stop reading
          limitedFilePipeline.destroy(sizeLimitError); // stop writing
        } else {
          const ok = limitedFilePipeline.write(chunk);
          cb();
          if (!ok) {
            filePipeline.pause();
            limitedFilePipeline.once('drain', () => filePipeline.resume());
          }
        }
      },
      final(cb) {
        limitedFilePipeline.end();
        cb();
      },
    });

    const onError = (err: Error) => {
      filePipeline.destroy(err);
      limitedFilePipeline.destroy(err);
      limiter.destroy(err);

      reject(err);
    };

    // All pipelines _must_ have error handlers since each
    // pipe can emit it's own error and will be considered uncaught (server crash)
    filePipeline.on('error', onError);
    limitedFilePipeline.on('error', onError);
    limiter.on('error', onError);

    filePipeline.pipe(limiter);

    const uploadP = uploadFileToS3(
      limitedFilePipeline,
      transformedMimetype,
      args.purpose,
      args.storageKey,
    );

    resolve(
      uploadP.then((uploadResult) => ({
        uploadResult,
        transformedMimetype,
      })),
    );
  });
}
