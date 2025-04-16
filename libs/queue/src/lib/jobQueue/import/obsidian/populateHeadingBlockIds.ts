import { randomUUID } from 'crypto';

export const populateHeadingBlockIds = (
  content: string,
  docInfoMap: Map<
    string,
    {
      id: string;
      blockId?: string;
    }
  >,
  obsidianArtifactId: string,
  artifactId: string,
): void => {
  // Replace Obsidian referenced id headers with a corresponding html artifact block element
  // Returns two elements (the match and one matching group) i.e. #Heading Heading Name ^a8eac6
  // 0. The full match
  // 1. The number of # characters
  // 2. The Heading Text
  // 3. The block id
  const headingRegex = /^ *(#+)(.*)\n*(\^\w{6})?/gm;
  for (const matchingGroups of content.matchAll(headingRegex)) {
    const blockId = randomUUID();

    // Populate both the heading text block id and the char id to the same block id
    const headingTextTrimmed = matchingGroups[2].trim();
    const obsidianHeadingBlockId = obsidianArtifactId + headingTextTrimmed;
    docInfoMap.set(obsidianHeadingBlockId, {
      id: artifactId,
      blockId,
    });

    const charId = matchingGroups[3];
    if (charId) {
      const obsidianCharBlockId = obsidianArtifactId + charId;
      docInfoMap.set(obsidianCharBlockId, {
        id: artifactId,
        blockId,
      });
    }
  }
};
