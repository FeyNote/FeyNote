import { ArtifactEditorBlock } from '@feynote/blocknote';

const _getBlockClosestParent = (
  blocks: ArtifactEditorBlock[],
  blockId: string,
  comparator: (block: ArtifactEditorBlock) => boolean,
  parent?: ArtifactEditorBlock,
): ArtifactEditorBlock | undefined | false => {
  for (const block of blocks) {
    if (comparator(block)) parent = block;
    if (block.id === blockId) return parent || false;

    const childResult = _getBlockClosestParent(
      block.children,
      blockId,
      comparator,
      parent,
    );
    // False is used to short-circuit a full tree search if we've already found the ID of our target node
    if (childResult || childResult === false) return childResult;
  }

  return;
};

export const getBlockClosestParent = (
  blocks: ArtifactEditorBlock[],
  blockId: string,
  comparator: (block: ArtifactEditorBlock) => boolean,
): ArtifactEditorBlock | undefined => {
  const result = _getBlockClosestParent(blocks, blockId, comparator, undefined);

  if (!result) return undefined;
  return result;
};
