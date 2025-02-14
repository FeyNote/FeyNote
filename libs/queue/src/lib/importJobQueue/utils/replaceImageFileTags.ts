import { randomUUID } from "crypto";

export const replaceImageFileTags = (content: string, imagePathToIdMap: Map<string, string>): string => {
  // Returns two elements (the match and the src url) i.e. <img src="file.png" />
  // 1. The full match
  // 2. The src url
  const imgRegex = /<img src="(.*?)".*?\/>/g
  for (const matchingGroups of content.matchAll(imgRegex)) {
    const imageSrc = matchingGroups[1];
    if (imageSrc.startsWith('http')) continue
    let imageId = imagePathToIdMap.get(imageSrc);
    if (!imageId) {
      imageId = randomUUID()
      imagePathToIdMap.set(imageSrc, randomUUID())
    }
    const replacementHtml = `<img fileId="${imageId}" />`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content
}
