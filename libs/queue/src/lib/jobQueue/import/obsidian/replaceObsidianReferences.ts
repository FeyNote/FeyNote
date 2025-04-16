import { getSafeArtifactId, getSafeFileId } from '@feynote/api-services';
import { randomUUID } from 'crypto';
import { isImagePath } from '../isImagePath';
import type { StandardizedImportInfo } from '../StandardizedImportInfo';
import { join } from 'path';

export const replaceObsidianReferences = async (
  content: string,
  docInfoMap: Map<
    string,
    {
      id: string;
      blockId?: string;
    }
  >,
  artifactId: string,
  pathToObsidianVaultDir: string,
  importInfo: StandardizedImportInfo,
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
    if (isImagePath(obsidianArtifactId)) {
      const fileId = (await getSafeFileId()).id;
      const path = join('/' + pathToObsidianVaultDir, obsidianArtifactId);
      importInfo.imageFilesToUpload.push({
        id: fileId,
        associatedArtifactId: artifactId,
        path,
      });

      const replacementHtml = `<img fileId="${fileId}" />`;
      content = content.replace(matchingGroups[0], replacementHtml);
      continue;
    }

    const artifactInfo = docInfoMap.get(obsidianArtifactId);
    const refrencedArtifactId =
      artifactInfo?.id ?? (await getSafeArtifactId()).id;
    if (!artifactInfo) {
      docInfoMap.set(obsidianArtifactId, {
        id: refrencedArtifactId,
      });
    }
    const headingReference = matchingGroups[3];
    let replacementHtml = `<span data-type="artifactReference" data-artifact-id="${refrencedArtifactId}"></span>`;
    if (headingReference) {
      const obsidianBlockId = obsidianArtifactId + headingReference;
      const blockId = docInfoMap.get(obsidianBlockId)?.blockId ?? randomUUID();
      if (!docInfoMap.has(obsidianBlockId)) {
        docInfoMap.set(obsidianBlockId, {
          id: refrencedArtifactId,
          blockId,
        });
      }
      replacementHtml = `<span data-type="artifactReference" data-artifact-block-id=${blockId} data-artifact-id="${refrencedArtifactId}"></span>`;
    }
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};
