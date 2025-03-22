import { randomUUID } from 'crypto';
import type { StandardizedImportInfo } from '../StandardizedImportInfo';

export const replaceObsidianImageHttpTags = (
  content: string,
  artifactId: string,
  importInfo: StandardizedImportInfo,
): string => {
  // Returns two elements (the match and the src url) i.e. <img src="file.png" />
  // 1. The full match
  // 2. The src url
  const imgRegex = /<img src="(.*?)".*?\/>/g;
  for (const matchingGroups of content.matchAll(imgRegex)) {
    console.log(
      `\n\nregex replaceImageHttpTags matched: ${matchingGroups[0]}\n\n`,
    );
    const imageSrc = matchingGroups[1];
    if (imageSrc.startsWith('http')) {
      const fileId = randomUUID();
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
