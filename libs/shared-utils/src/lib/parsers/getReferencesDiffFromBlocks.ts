import { ArtifactEditorBlock } from '@feynote/blocknote';
import {
  ReferencesFromBlocksResult,
  getReferencesFromBlocks,
} from './getReferencesFromBlocks';

const getKeyForReference = (reference: ReferencesFromBlocksResult) => {
  if (reference.targetArtifactBlockId) {
    return reference.targetArtifactId + reference.targetArtifactBlockId;
  } else {
    return reference.targetArtifactId;
  }
};

export function getReferencesDiffFromBlocks(
  oldBlocks: ArtifactEditorBlock[],
  newBlocks: ArtifactEditorBlock[],
) {
  const oldReferences = getReferencesFromBlocks(oldBlocks);
  const oldReferencesById = new Map(
    oldReferences.map((el) => [getKeyForReference(el), el]),
  );
  const newReferences = getReferencesFromBlocks(newBlocks);
  const newReferencesById = new Map(
    newReferences.map((el) => [getKeyForReference(el), el]),
  );

  const deletedReferences = oldReferences.filter((oldReference) => {
    return !newReferencesById.has(getKeyForReference(oldReference));
  });
  const addedReferences = newReferences.filter((newReference) => {
    return !oldReferencesById.has(getKeyForReference(newReference));
  });

  return {
    addedReferences,
    deletedReferences,
  };
}
