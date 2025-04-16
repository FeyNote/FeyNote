import { getSafeArtifactId } from '@feynote/api-services';
import { randomUUID } from 'crypto';

export const replaceObsidianReferences = async (
  content: string,
  docInfoMap: Map<
    string,
    {
      id: string;
      blockId?: string;
    }
  >,
): Promise<string> => {
  // Returns four elements (the match and three matching groups) for each artifact references; i.e. ![[Doc Path#Header Id|Display Text]]
  // 0. The full match
  // 1. The artifact path
  // 2. The Heading Text or Block Id Including # (Not used)
  // 3. The Heading Text or Block Id
  // 4. The |display text (Not used)
  const referenceRegex = /!?\[\[(.+?)(#([^|]*?))?(\|.*?)?\]\]/g;
  for (const matchingGroups of content.matchAll(referenceRegex)) {
    const obsidianArtifactId = matchingGroups[1];
    const artifactInfo = docInfoMap.get(obsidianArtifactId);
    const artifactId = artifactInfo?.id ?? (await getSafeArtifactId()).id;
    if (!artifactInfo) {
      docInfoMap.set(obsidianArtifactId, {
        id: artifactId,
      });
    }
    const headingReference = matchingGroups[3];
    let replacementHtml = `<span data-type="artifactReference" data-artifact-id="${artifactId}"></span>`;
    if (headingReference) {
      const obsidianBlockId = obsidianArtifactId + headingReference;
      const blockId = docInfoMap.get(obsidianBlockId)?.blockId ?? randomUUID();
      if (!docInfoMap.has(obsidianBlockId)) {
        docInfoMap.set(obsidianBlockId, {
          id: artifactId,
          blockId,
        });
      }
      replacementHtml = `<span data-type="artifactReference" data-artifact-block-id=${blockId} data-artifact-id="${artifactId}"></span>`;
    }
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};
