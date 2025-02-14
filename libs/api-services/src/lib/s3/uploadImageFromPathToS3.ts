import { Capability } from '@feynote/shared-utils';
import sharp from 'sharp';
import { getImageQuality } from './getImageQuality';
import { uploadFileToS3 } from './uploadFileToS3';
import { FilePurpose } from '@prisma/client';

export const uploadImageFromPathToS3 = async (
  path: string,
  userCapabilities: Set<Capability>,
) => {
  const { maxResolution, quality } = getImageQuality(userCapabilities);
  console.log(`path: ${path}`);
  const fileBuffer = await sharp(path)
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

  const purpose = FilePurpose.artifact;
  const mimetype = 'image/jpeg';
  console.log(`uploading buffer to s3`);
  const uploadResult = await uploadFileToS3(fileBuffer, mimetype, purpose);

  return {
    mimetype,
    purpose,
    uploadResult,
  };
};
