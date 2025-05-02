import { extname } from 'path';

export const isAudioPath = (filePath: string): boolean => {
  const ext = extname(filePath) || filePath;
  return (
    ext === '.aac' ||
    ext === '.avi' ||
    ext === '.cda' ||
    ext === '.mp3' ||
    ext === '.mid' ||
    ext === '.midi' ||
    ext === '.oga' ||
    ext === '.opus' ||
    ext === '.wav' ||
    ext === '.weba'
  );
};
