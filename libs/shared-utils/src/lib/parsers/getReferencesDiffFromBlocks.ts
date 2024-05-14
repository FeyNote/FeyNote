import { ArtifactEditorBlock } from '@feynote/blocknote';
import {
  RawArtifactBlockReference,
  RawArtifactReference,
  getReferencesFromBlocks,
} from './getReferencesFromBlocks';

export function getReferencesDiffFromBlocks(
  oldBlocks: ArtifactEditorBlock[],
  newBlocks: ArtifactEditorBlock[],
) {
  const oldReferences = getReferencesFromBlocks(oldBlocks);
  const oldArtifactReferencesById = new Map(
    oldReferences.artifactReferences.map((el) => [el.targetArtifactId, el]),
  );
  const oldArtifactBlockReferencesById = new Map(
    oldReferences.artifactBlockReferences.map((el) => [
      el.targetArtifactId + el.targetArtifactBlockId,
      el,
    ]),
  );
  const newReferences = getReferencesFromBlocks(newBlocks);
  const newArtifactReferencesById = new Map(
    newReferences.artifactReferences.map((el) => [el.targetArtifactId, el]),
  );
  const newArtifactBlockReferencesById = new Map(
    newReferences.artifactBlockReferences.map((el) => [
      el.targetArtifactId + el.targetArtifactBlockId,
      el,
    ]),
  );

  const addedArtifactReferences: RawArtifactReference[] = [];
  const deletedArtifactReferences: RawArtifactReference[] = [];
  for (const newReference of newReferences.artifactReferences) {
    if (!oldArtifactReferencesById.has(newReference.targetArtifactId)) {
      addedArtifactReferences.push(newReference);
    }
  }
  for (const oldReference of oldReferences.artifactReferences) {
    if (!newArtifactReferencesById.has(oldReference.targetArtifactId)) {
      deletedArtifactReferences.push(oldReference);
    }
  }

  const addedArtifactBlockReferences: RawArtifactBlockReference[] = [];
  const deletedArtifactBlockReferences: RawArtifactBlockReference[] = [];
  for (const newReference of newReferences.artifactBlockReferences) {
    if (
      !oldArtifactBlockReferencesById.has(
        newReference.targetArtifactId + newReference.targetArtifactBlockId,
      )
    ) {
      addedArtifactBlockReferences.push(newReference);
    }
  }
  for (const oldReference of oldReferences.artifactBlockReferences) {
    if (
      !newArtifactBlockReferencesById.has(
        oldReference.targetArtifactId + oldReference.targetArtifactBlockId,
      )
    ) {
      deletedArtifactBlockReferences.push(oldReference);
    }
  }

  return {
    addedArtifactReferences,
    deletedArtifactReferences,

    addedArtifactBlockReferences,
    deletedArtifactBlockReferences,
  };
}
