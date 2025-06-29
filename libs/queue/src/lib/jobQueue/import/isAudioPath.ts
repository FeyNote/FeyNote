import { extname } from 'path';

export const isAudioPath = (filePath: string): boolean => {
  const ext = extname(filePath) || filePath;
  return ext === '.mp3';
};
