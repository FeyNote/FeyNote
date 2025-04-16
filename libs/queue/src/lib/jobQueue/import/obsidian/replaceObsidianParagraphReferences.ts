import { randomUUID } from 'crypto';

export const replaceObsidianParagraphReferences = (
  content: string,
  artifactId: string,
  docInfoMap: Map<
    string,
    {
      id: string;
      blockId?: string;
    }
  >,
  obsidianArtifactId: string,
): string => {
  // Replace Obsidian referenced id headers with a corresponding html artifact block element
  // Returns two elements (the match and one matching group) i.e. #Heading Heading Name ^a8eac6
  // 0. The full match
  // 1. The text before any newlines leading to block id
  // 2. The block id
  const headingRegex = /(^[^#\n]+)\n*(\^\w{6})/gm;
  for (const matchingGroups of content.matchAll(headingRegex)) {
    // Block Id is always the block id if it exists otherwise its the heading text
    let obsidianBlockId = matchingGroups[2];
    obsidianBlockId = obsidianArtifactId + obsidianBlockId;
    const blockId = docInfoMap.get(obsidianBlockId)?.blockId ?? randomUUID();
    if (!docInfoMap.has(obsidianBlockId)) {
      docInfoMap.set(obsidianBlockId, {
        id: artifactId,
        blockId,
      });
    }
    const replacementHtml = `<p data-id="${blockId}">${matchingGroups[1]}</p>`;
    content = content.replace(matchingGroups[0], replacementHtml);
  }
  return content;
};
