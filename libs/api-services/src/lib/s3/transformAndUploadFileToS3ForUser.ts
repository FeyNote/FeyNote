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
  const { maxResolution, quality, maxFileSize } = await getFileLimitsForUser(
    args.userId,
  );

  const filePipeline = new PassThrough();
  if (IMAGE_FILE_TYPES.includes(args.mimetype)) {
    transformImage(
      args.file,
      filePipeline,
      maxResolution,
      maxResolution,
      quality,
      'inside',
    );
  } else {
    args.file.pipe(filePipeline);
  }

  return new Promise<ReturnType<typeof uploadFileToS3>>((resolve, reject) => {
    let totalBytes = 0;
    const limitedFilePipeline = new PassThrough();
    const sizeLimitError = new FileSizeLimitError();

    const limiter = new Writable({
      write(chunk, _enc, cb) {
        totalBytes += chunk.length;
        if (totalBytes > maxFileSize) {
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

    resolve(
      uploadFileToS3(
        limitedFilePipeline,
        args.mimetype,
        args.purpose,
        args.storageKey,
      ),
    );
  });
}
