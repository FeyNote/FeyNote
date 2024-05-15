import { ArtifactEditorBlock } from '@feynote/blocknote';

export interface ReferencesFromBlocksResult {
  artifactBlockId: string;
  targetArtifactId: string;
  targetArtifactBlockId?: string;
  referenceText: string;
}

export const getReferencesFromBlocks = (
  blocks: ArtifactEditorBlock[],
): ReferencesFromBlocksResult[] => {
  const results: ReferencesFromBlocksResult[] = [];

  for (const block of blocks) {
    const childResults = getReferencesFromBlocks(block.children);
    results.push(...childResults);

    if (
      block.type === 'heading' ||
      block.type === 'paragraph' ||
      block.type === 'bulletListItem' ||
      block.type === 'numberedListItem'
    ) {
      for (const content of block.content) {
        if (content.type === 'artifactReference') {
          results.push({
            artifactBlockId: block.id,

            targetArtifactId: content.props.artifactId,
            referenceText: content.props.referenceText,
          });
        }
        if (content.type === 'artifactBlockReference') {
          results.push({
            artifactBlockId: block.id,

            targetArtifactId: content.props.artifactId,
            targetArtifactBlockId: content.props.artifactBlockId,
            referenceText: content.props.referenceText,
          });
        }
      }
    }
  }

  return results;
};
