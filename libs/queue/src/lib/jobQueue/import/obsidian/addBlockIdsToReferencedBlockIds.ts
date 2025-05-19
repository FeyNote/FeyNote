import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

export const addBlockIdsToReferencedBlockIds = (
  markdown: string,
  referenceIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
  obsidianFileId: string,
): string => {
  // Returns three elements i.e. Arbitrary Text ...optional \n..^a8eac6
  // Ignores references such as [[Journaling in Obsidian with QuickAdd#^665672]]
  // 0. The full match
  // 1. The reference text (Not-used)
  // 2. The block id
  const blockRegex = /(.+)\n*(\^\w{6})$/gm;
  for (const matchingGroups of markdown.matchAll(blockRegex)) {
    const match = matchingGroups[0];
    const blockId = obsidianFileId + matchingGroups[2];

    const referencedBlockWithId = referenceIdToBlockInfoMap.get(blockId);
    if (referencedBlockWithId) {
      markdown = markdown.replace(
        match,
        `<p data-id="${referencedBlockWithId.id}">${match}</p>`,
      );
    }
    markdown = markdown.replace(matchingGroups[2], '');
  }
  return markdown;
};
