import path, { extname } from 'path';

export const getObsidianReferenceId = (
  filePath: string,
  pathToObsidianDir: string,
) => {
  let obsidianReferenceId = pathToObsidianDir
    ? filePath.replace(path.sep + pathToObsidianDir + path.sep, '')
    : filePath;
  // Markdown references dont include the file extension
  if (extname(filePath) === '.md')
    obsidianReferenceId = obsidianReferenceId.replace(/\.[^/.]+$/, '');
  return obsidianReferenceId;
};
