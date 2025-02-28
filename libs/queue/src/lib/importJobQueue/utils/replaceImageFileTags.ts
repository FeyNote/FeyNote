import { randomUUID } from "crypto";
import type { StandardizedImportInfo } from "../StandardizedImportInfo";

export const replaceObsidianImageFileTags = (
  content: string,
  docInfoMap: Map<string, { //TODO: Clean this up to be just path
    id: string;
    path: string;
  }>,
  artifactId: string,
  importInfo: StandardizedImportInfo
) => {
  // Returns two elements (the match and the src url) i.e. <img src="file.png" />
  // 1. The full match
  // 2. The src url
  const imgRegex = /<img src="(.*?)".*?\/>/g
  for (const matchingGroups of content.matchAll(imgRegex)) {
    const imageSrc = matchingGroups[1];
    if (imageSrc.startsWith('http')) continue
    const documentInfo = docInfoMap.get(imageSrc);
    if (!documentInfo) continue; // Referenced item does not exist
    const id = randomUUID();
    importInfo.imageFilesToUpload.push({
      id,
      associatedArtifactId: artifactId,
      path: documentInfo.path,
    })
    const replacementHtml = `<img fileId="${id}" />`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content
}
