import { randomUUID } from 'crypto';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';
import removeMarkdown from 'remove-markdown';

export const populateBlockIdToBlockInfoMap = (
  content: string,
  referenceIdToArtifactBlockInfo: Map<string, ArtifactBlockInfo>,
  artifactId: string,
  obsidianFileId: string,
): void => {
  // Returns three elements i.e. Arbitrary Text ...optional \n..^a8eac6
  // Ignores references such as [[Journaling in Obsidian with QuickAdd#^665672]]
  // 0. The full match
  // 1. The reference text
  // 2. The block id
  const headingRegex = /(.+)\n*(\^\w{6})$/gm;
  for (const matchingGroups of content.matchAll(headingRegex)) {
    const blockId = matchingGroups[2];
    const referenceId = `${obsidianFileId}${blockId}`;
    let referenceText = matchingGroups[1]
      .trim()
      .replaceAll(/!?\[\[.*?\]\]/g, '@...');
    referenceText = removeMarkdown(referenceText);

    referenceIdToArtifactBlockInfo.set(referenceId, {
      id: randomUUID(),
      artifactId,
      referenceText: referenceText,
    });
  }
};
