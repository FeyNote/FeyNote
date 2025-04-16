import path from 'path';
import type { StandardizedImportInfo } from '../StandardizedImportInfo';
import { getSafeFileId } from '@feynote/api-services';

export const replaceObsidianImageFileTags = async (
  content: string,
  artifactId: string,
  importInfo: StandardizedImportInfo,
  pathToObsidianVaultDir: string,
) => {
  // Returns two elements (the match and the src url) i.e. <img src="file.png" />
  // 0. The full match
  // 1. The src file path
  const imgRegex = /<img src="(.*?)".*?\/>/g;
  for (const matchingGroups of content.matchAll(imgRegex)) {
    const imagePath = matchingGroups[1];
    if (imagePath.startsWith('http')) continue;
    const id = (await getSafeFileId()).id;
    importInfo.imageFilesToUpload.push({
      id,
      associatedArtifactId: artifactId,
      path: path.join('/' + pathToObsidianVaultDir, imagePath),
    });
    const replacementHtml = `<img fileId="${id}" />`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};
