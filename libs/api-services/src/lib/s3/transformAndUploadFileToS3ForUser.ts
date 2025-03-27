import { FilePurpose } from '@prisma/client';
import { PassThrough, Readable, Writable } from 'stream';
import { getFileLimitsForUser } from './getFileLimitsForUser';
import { uploadFileToS3 } from './uploadFileToS3';
import { transformImage } from './transformImage';

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

  let totalBytes = 0;
  const limitedFilePipeline = new PassThrough();

  const sizeLimitError = new Error('File size exceeds maximum allowed size');

  const limiter = new Writable({
    write(chunk, _enc, cb) {
      totalBytes += chunk.length;
      if (totalBytes > maxFileSize) {
        cb(sizeLimitError); // reject immediately
        filePipeline.destroy(sizeLimitError);
        limitedFilePipeline.end(); // close downstream
      } else {
        limitedFilePipeline.write(chunk, cb);
      }
    },
  });

  filePipeline.pipe(limiter);
  filePipeline.on('end', () => {
    limitedFilePipeline.end();
  });
  filePipeline.on('error', (err) => {
    limitedFilePipeline.destroy(err);
  });

  const uploadResult = await uploadFileToS3(
    limitedFilePipeline,
    args.mimetype,
    args.purpose,
  );

  return uploadResult;
}
