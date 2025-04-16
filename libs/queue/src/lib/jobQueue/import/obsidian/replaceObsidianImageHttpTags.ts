import type { StandardizedImportInfo } from '../StandardizedImportInfo';
import { getSafeFileId } from '@feynote/api-services';

export const replaceObsidianImageHttpTags = async (
  content: string,
  artifactId: string,
  importInfo: StandardizedImportInfo,
): Promise<string> => {
  // Returns two elements (the match and the src url) i.e. <img src="file.png" />
  // 1. The full match
  // 2. The src url
  const imgRegex = /<img src="(.*?)".*?\/>/g;
  for (const matchingGroups of content.matchAll(imgRegex)) {
    const imageSrc = matchingGroups[1];
    if (imageSrc.startsWith('http')) {
      const fileId = (await getSafeFileId()).id;
      const replacementHtml = `<img data-fallback="${imageSrc}" fileId="${fileId}" />`;
      content = content.replace(matchingGroups[0], replacementHtml);
      importInfo.imageFilesToUpload.push({
        id: fileId,
        url: imageSrc,
        associatedArtifactId: artifactId,
      });
    }
  }

  return content;
};
