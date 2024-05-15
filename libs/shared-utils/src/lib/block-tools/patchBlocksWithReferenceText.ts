import { ArtifactEditorBlock } from '@feynote/blocknote';
import { getBlocksById } from '../parsers/getBlocksById';

/**
 * This method "patches" the provided blocknoteContent with the provided references
 * updating the reference text within the blocknoteContent with the provided referenceText.
 */
export function patchBlocksWithReferenceText(
  blocknoteContent: ArtifactEditorBlock[],
  references: {
    artifactBlockId: string;
    targetArtifactId: string;
    targetArtifactBlockId?: string;
    referenceText: string;
    isBroken: boolean;
  }[],
) {
  const blocksById = getBlocksById(blocknoteContent);
  for (const reference of references) {
    const sourceBlock = blocksById[reference.artifactBlockId];
    if (!sourceBlock) continue;
    if (
      sourceBlock.type === 'paragraph' ||
      sourceBlock.type === 'heading' ||
      sourceBlock.type === 'bulletListItem' ||
      sourceBlock.type === 'numberedListItem'
    ) {
      for (const inlineContent of sourceBlock.content) {
        if (
          inlineContent.type === 'artifactReference' &&
          inlineContent.props.artifactId === reference.targetArtifactId &&
          reference.targetArtifactBlockId === undefined
        ) {
          (inlineContent.props.isBroken as boolean) = reference.isBroken;
          (inlineContent.props.referenceText as string) =
            reference.referenceText;
        }
        if (
          inlineContent.type === 'artifactBlockReference' &&
          inlineContent.props.artifactId === reference.targetArtifactId &&
          inlineContent.props.artifactBlockId ===
            reference.targetArtifactBlockId
        ) {
          (inlineContent.props.isBroken as boolean) = reference.isBroken;
          (inlineContent.props.referenceText as string) =
            reference.referenceText;
        }
      }
    }
  }
}
