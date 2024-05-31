import { ArtifactEditorBlock } from '@feynote/blocknote';

export const getBlocksById = (
  blocks: ArtifactEditorBlock[],
): Record<string, ArtifactEditorBlock> => {
  const blocksById: Record<string, ArtifactEditorBlock> = {};
  for (const block of blocks) {
    const childrenResults = getBlocksById(block.children);
    for (const key in childrenResults) {
      blocksById[key] = childrenResults[key];
    }

    blocksById[block.id] = block;
  }

  return blocksById;
};
