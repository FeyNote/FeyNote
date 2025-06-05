import { extname } from 'path';

export const isImagePath = (filePath: string): boolean => {
  const ext = extname(filePath) || filePath;
  return (
    ext === '.png' ||
    ext === '.jpg' ||
    ext === '.jpeg' ||
    ext === '.svg'
  );
};
