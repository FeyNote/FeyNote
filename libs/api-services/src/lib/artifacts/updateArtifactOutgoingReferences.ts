import { ArtifactEditorBlock } from '@feynote/blocknote';
import { prisma } from '@feynote/prisma/client';
import { getReferencesFromBlocks, getBlocksDiff } from '@feynote/shared-utils';
import { Prisma } from '@prisma/client';

export async function updateArtifactOutgoingReferences(
  userId: string,
  artifactId: string,
  oldBlocknoteContent: ArtifactEditorBlock[],
  newBlocknoteContent: ArtifactEditorBlock[],
  tx: Prisma.TransactionClient = prisma,
) {
  const diff = getBlocksDiff(
    oldBlocknoteContent || [],
    newBlocknoteContent || [],
  );

  const addedBlocks = [...diff.values()]
    .map((el) => el.newBlock)
    .filter((el): el is NonNullable<typeof el> => !!el);

  const {
    artifactReferences: addedBlocksArtifactReferences,
    artifactBlockReferences: addedBlocksArtifactBlockReferences,
  } = getReferencesFromBlocks(addedBlocks);

  // We must create display text entries so that we can reference them,
  // but default to skipping if they already exist.
  // We also only care about creating display texts for new references that don't exist yet.
  // Cleanup should be handled separately, since clipboard and such exists and client may want
  // to reference in future, or other artifact references may be dependent and we don't want to do that here.
  await tx.artifactReferenceDisplayText.createMany({
    data: addedBlocksArtifactReferences.map((newBlockReference) => ({
      artifactId: newBlockReference.targetArtifactId,
      displayText: newBlockReference.displayText, // We trust the client to provide us with up-to-date display text when creating a new reference
    })),
    skipDuplicates: true,
  });
  await tx.artifactBlockReferenceDisplayText.createMany({
    data: addedBlocksArtifactBlockReferences.map((newBlockReference) => ({
      artifactId: newBlockReference.targetArtifactId,
      artifactBlockId: newBlockReference.targetArtifactBlockId,
      displayText: newBlockReference.displayText, // We trust the client to provide us with up-to-date display text when creating a new reference
    })),
    skipDuplicates: true,
  });

  // const referenceDiff = getReferencesDiffFromBlocks(
  //   oldBlocknoteContent,
  //   newBlocknoteContent,
  // );

  // Recreate all artifact references since it's more efficient to do so than to
  // try and diff
  const { artifactReferences, artifactBlockReferences } =
    getReferencesFromBlocks(newBlocknoteContent);
  const referencedArtifactIds = [
    ...artifactReferences.map(
      (artifactReference) => artifactReference.targetArtifactId,
    ),
    ...artifactBlockReferences.map(
      (artifactReference) => artifactReference.targetArtifactId,
    ),
  ];
  const connectableReferencedArtifacts = await tx.artifact.findMany({
    where: {
      id: {
        in: referencedArtifactIds,
      },
    },
    select: {
      id: true,
      userId: true,
    },
  });
  for (const connectableReferencedArtifact of connectableReferencedArtifacts) {
    if (connectableReferencedArtifact.userId !== userId) {
      throw new Error("Referenced an artifact that user doesn't own!");
    }
  }
  const connectableReferencedArtifactIds = new Set(
    connectableReferencedArtifacts.map(
      (connectableReferencedArtifact) => connectableReferencedArtifact.id,
    ),
  );
  await tx.artifactReference.deleteMany({
    where: {
      artifactId,
    },
  });
  await tx.artifactReference.createMany({
    data: artifactReferences.map((reference) => ({
      artifactId,
      artifactBlockId: reference.artifactBlockId,

      // We allow abitrary connections (for example, to artifacts that no longer exist!), but we do not connect them with a relationship if they aren't connectable
      referenceTargetArtifactId: connectableReferencedArtifactIds.has(
        reference.targetArtifactId,
      )
        ? reference.targetArtifactId
        : undefined,

      targetArtifactId: reference.targetArtifactId,
    })),
  });
  await tx.artifactBlockReference.deleteMany({
    where: {
      artifactId,
    },
  });
  await tx.artifactBlockReference.createMany({
    data: artifactBlockReferences.map((reference) => ({
      artifactId,
      artifactBlockId: reference.artifactBlockId,

      // We allow abitrary connections (for example, to artifacts that no longer exist!), but we do not connect them with a relationship if they aren't connectable
      referenceTargetArtifactId: connectableReferencedArtifactIds.has(
        reference.targetArtifactId,
      )
        ? reference.targetArtifactId
        : undefined,

      targetArtifactId: reference.targetArtifactId,
      targetArtifactBlockId: reference.targetArtifactBlockId!,
    })),
  });
}
