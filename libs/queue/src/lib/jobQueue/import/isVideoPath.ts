import { extname } from 'path';

export const isVideoPath = (filePath: string): boolean => {
  const ext = extname(filePath) || filePath;
  return (
    ext === '.mp4' ||
    ext === '.webm' ||
    ext === '.ogv' ||
    ext === '.avi' ||
    ext === '.mpeg'
  );
};
