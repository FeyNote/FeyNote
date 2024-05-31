import { ArtifactEditorBlock } from '@feynote/blocknote';

export const getBlockById = (
  blocks: ArtifactEditorBlock[],
  blockId: string,
): ArtifactEditorBlock | undefined => {
  for (const block of blocks) {
    if (block.id === blockId) return block;

    const childResult = getBlockById(block.children, blockId);
    if (childResult) return childResult;
  }

  return;
};
