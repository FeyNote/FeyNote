import { parse, extname } from 'path';
import { isImagePath } from './isImagePath';
import { randomUUID } from 'crypto';

export const replaceObsidianReferences = (
  content: string,
  docInfoMap: Map<string, {
    id: string;
    path: string;
  }>,
  imageFilesToUpload: {
    id: string;
    associatedArtifactId: string;
    path: string;
  }[],
  artifactId: string
  ): string => {
    // Returns four elements (the match and three matching groups) for each artifact references; i.e. ![[Doc Path#Header Id|Display Text]]
    // 1. The full match
    // 2. The artifact path
    // 3. The Header Id (Needed for block references)
    // 4. The |display text (Not used)
    // 5. The display text (Reference Text)
    const referenceRegex = /!?\[\[(.+?)(#\^\w{6})?(\|(.+))?\]\]/g;
    for (const matchingGroups of content.matchAll(referenceRegex)) {
      let replacementHtml = '';
      const referencePath = matchingGroups[1];
      const documentInfo = docInfoMap.get(referencePath);
      if (!documentInfo) continue; // Referenced item does not exist

      const referenceText = matchingGroups.at(5) ?? parse(referencePath).name;
      const blockId = matchingGroups.at(2);
      // Artifact reference
      if (extname(documentInfo.path) === '.md') {
        if (blockId) {
          replacementHtml = `<span data-type="artifactReference" data-artifact-block-id=${blockId} data-artifact-id="${documentInfo.id}" data-artifact-reference-text="${referenceText}"></span>`;
        } else {
          replacementHtml = `<span data-type="artifactReference" data-artifact-id="${documentInfo.id}" data-artifact-reference-text="${referenceText}"></span>`;
        }
      } else if (isImagePath(documentInfo.path)) {
        // What happens when the referenced image isn't present? i.e. markdown points to an image filepath that doesn't exist
        const id = randomUUID()
        replacementHtml = `<img fileId="${id}" />`;
        imageFilesToUpload.push({
          id,
          associatedArtifactId: artifactId,
          path: documentInfo.path,
        })
      }

      content = content.replace(matchingGroups[0], replacementHtml);
    }
  return content
}
