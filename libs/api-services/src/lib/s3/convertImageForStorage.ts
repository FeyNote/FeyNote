import sharp from 'sharp';
import { getImageQuality } from './getImageQuality';

export const convertImageForStorage = async (
  userId: string,
  input: Buffer | string,
) => {
  const { maxResolution, quality } = await getImageQuality(userId);
  const fileBuffer = await sharp(input)
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
  return fileBuffer;
};
