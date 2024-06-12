import { ArtifactEditorBlock } from '@feynote/blocknote';

const _getBlockParentById = (
  blocks: ArtifactEditorBlock[],
  blockId: string,
  parent?: ArtifactEditorBlock,
): ArtifactEditorBlock | undefined => {
  for (const block of blocks) {
    if (block.id === blockId) return parent;

    const childResult = _getBlockParentById(block.children, blockId, block);
    if (childResult) return childResult;
  }

  return;
};

export const getBlockParentById = (
  blocks: ArtifactEditorBlock[],
  blockId: string,
): ArtifactEditorBlock | undefined => {
  return _getBlockParentById(blocks, blockId, undefined);
};
