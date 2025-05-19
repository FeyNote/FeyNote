import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

export const addBlockIdsToReferencedHeaders = (
  markdown: string,
  referenceIdToBlockInfoMap: Map<string, ArtifactBlockInfo>,
  obsidianFileId: string,
): string => {
  // Returns three elements i.e. Arbitrary Text ...optional \n..^a8eac6
  // Ignores references such as [[Journaling in Obsidian with QuickAdd#^665672]]
  // 0. The full match
  // 1. The heading text
  // 2. The block id (not-used)
  const headingRegex = /^#+(.*?)(\^\w{6})?$/g;
  for (const matchingGroups of markdown.matchAll(headingRegex)) {
    const match = matchingGroups[0];
    const headingText = matchingGroups[1].trim();
    const referenceId = `${obsidianFileId}#${headingText}`;

    const referencedBlockWithId = referenceIdToBlockInfoMap.get(referenceId);
    if (referencedBlockWithId) {
      markdown = markdown.replace(
        match,
        `<p data-id="${referencedBlockWithId.id}">${match}</p>`,
      );
    }
  }
  return markdown;
};
