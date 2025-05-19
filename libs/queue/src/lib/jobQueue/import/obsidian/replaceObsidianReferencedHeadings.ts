import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

export const replaceObsidianReferencedHeadings = (
  content: string,
  referenceIdToArtifactBlockInfo: Map<string, ArtifactBlockInfo>,
  obsidianFileId: string,
): string => {
  // Replace Obsidian referenced id headers with a corresponding html artifact block element
  // Returns two elements (the match and one matching group) i.e. #Heading Heading Name ^a8eac6
  // 0. The full match
  // 1. The number of # characters
  // 2. The Heading Text
  // 3. The block id (Not used since points to same preprocessed id as the heading text)
  const headingRegex = /(#+)(.*)\n*(\^\w{6})?/gm;
  for (const matchingGroups of content.matchAll(headingRegex)) {
    const headingTextTrimmed = matchingGroups[2].trim();
    const externalBlockId = `${obsidianFileId}#${headingTextTrimmed}`;
    const localBlockId = `#${headingTextTrimmed}`;
    const blockInfo =
      referenceIdToArtifactBlockInfo.get(externalBlockId) ||
      referenceIdToArtifactBlockInfo.get(localBlockId);

    // All block ids are preprocessed, if none is found ignore and continue
    if (!blockInfo) continue;
    const hCharCount = matchingGroups[1].length;
    const replacementHtml = `<h${hCharCount} data-id="${blockInfo.id}">${headingTextTrimmed}</h${hCharCount}>\n`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};
