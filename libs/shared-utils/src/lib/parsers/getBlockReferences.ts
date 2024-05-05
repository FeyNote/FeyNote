import { ArtifactEditorBlock } from '@feynote/blocknote';

export interface BlocksReferencesResult {
  artifactId: string;
  artifactBlockId?: string;
}

export const getBlockReferences = (blocks: ArtifactEditorBlock[]) => {
  const results: BlocksReferencesResult[] = [];
  for (const block of blocks) {
    const childrenResults = getBlockReferences(block.children);
    results.push(...childrenResults);

    if (
      block.type === 'heading' ||
      block.type === 'paragraph' ||
      block.type === 'bulletListItem' ||
      block.type === 'numberedListItem'
    ) {
      for (const content of block.content) {
        if (content.type === 'artifactReference') {
          results.push({
            artifactId: content.props.artifactId,
          });
        }
        if (content.type === 'artifactBlockReference') {
          results.push({
            artifactId: content.props.artifactId,
            artifactBlockId: content.props.artifactBlockId,
          });
        }
      }
    }
  }

  return results;
};
