import { Readable, Writable } from 'stream';
import sharp from 'sharp';

export const transformImage = (
  inputStream: Readable,
  outputStream: Writable,
  width: number,
  height: number,
  quality: number,
  fit: keyof sharp.FitEnum,
) => {
  const transformer = sharp()
    .rotate()
    .resize(width, height, {
      fit,
      withoutEnlargement: true,
    })
    .jpeg({
      quality,
      mozjpeg: true,
    })
    .pipe(outputStream);

  inputStream.pipe(transformer);
};
