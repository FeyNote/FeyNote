import { randomUUID } from 'crypto';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

export const populateHeadersToBlockInfoMap = (
  content: string,
  referenceIdToArtifactBlockInfo: Map<string, ArtifactBlockInfo>,
  artifactId: string,
  obsidianFileId: string,
): void => {
  // Returns three elements i.e. # Some Heading ^a8eac6
  // 0. The full match
  // 1. The heading text
  // 2. The block id (not-used)
  const headingRegex = /^#+(.*?)(\^\w{6})?$/g;
  for (const matchingGroups of content.matchAll(headingRegex)) {
    const headingText = matchingGroups[1].trim();
    const referenceId = `${obsidianFileId}#${headingText}`;
    referenceIdToArtifactBlockInfo.set(referenceId, {
      id: randomUUID(),
      artifactId,
      referenceText: headingText,
    });
  }
};
