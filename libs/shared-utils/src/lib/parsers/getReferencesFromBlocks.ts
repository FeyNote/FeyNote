import { ArtifactEditorBlock } from '@feynote/blocknote';

export type RawArtifactReference = {
  artifactBlockId: string;
  targetArtifactId: string;
  displayText: string;
}

export type RawArtifactBlockReference = {
  artifactBlockId: string;
  targetArtifactId: string;
  targetArtifactBlockId: string;
  displayText: string;
}

interface ReferencesFromBlocksResult {
  artifactReferences: RawArtifactReference[],
  artifactBlockReferences: RawArtifactBlockReference[],
}

export const getReferencesFromBlocks = (blocks: ArtifactEditorBlock[]): ReferencesFromBlocksResult => {
  const artifactReferences: RawArtifactReference[] = [];
  const artifactBlockReferences: RawArtifactBlockReference[] = [];

  for (const block of blocks) {
    const {
      artifactReferences: childArtifactReferences,
      artifactBlockReferences: childArtifactBlockReferences,
    } = getReferencesFromBlocks(block.children);
    artifactReferences.push(...childArtifactReferences);
    artifactBlockReferences.push(...childArtifactBlockReferences);

    if (
      block.type === 'heading' ||
      block.type === 'paragraph' ||
      block.type === 'bulletListItem' ||
      block.type === 'numberedListItem'
    ) {
      for (const content of block.content) {
        if (content.type === 'artifactReference') {
          artifactReferences.push({
            artifactBlockId: block.id,

            targetArtifactId: content.props.artifactId,
            displayText: content.props.referenceText
          });
        }
        if (content.type === 'artifactBlockReference') {
          artifactBlockReferences.push({
            artifactBlockId: block.id,

            targetArtifactId: content.props.artifactId,
            targetArtifactBlockId: content.props.artifactBlockId,
            displayText: content.props.referenceText
          });
        }
      }
    }
  }

  return {
    artifactReferences,
    artifactBlockReferences
  };
};
