import { prisma } from '@feynote/prisma/client';
import { getReferencesFromJSONContent } from '@feynote/shared-utils';
import { Prisma } from '@prisma/client';
import { JSONContent } from '@tiptap/core';

export async function updateArtifactOutgoingReferences(
  artifactId: string,
  jsonContent: JSONContent,
  tx: Prisma.TransactionClient = prisma,
) {
  // Recreate all artifact references since it's more efficient to do so than to
  // try and diff
  const referencesFromJSONContent = getReferencesFromJSONContent(jsonContent);
  const referencedArtifactIds = referencesFromJSONContent.map(
    (artifactReference) => artifactReference.targetArtifactId,
  );
  const connectableReferencedArtifacts = await tx.artifact.findMany({
    where: {
      id: {
        in: referencedArtifactIds,
      },
    },
    select: {
      id: true,
    },
  });

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
    data: referencesFromJSONContent.map((reference) => ({
      artifactId,
      artifactBlockId: reference.artifactBlockId,

      // We allow abitrary connections (for example, to artifacts that no longer exist!), but we do not connect them with a relationship if they aren't connectable
      referenceTargetArtifactId: connectableReferencedArtifactIds.has(
        reference.targetArtifactId,
      )
        ? reference.targetArtifactId
        : undefined,

      targetArtifactId: reference.targetArtifactId,
      targetArtifactBlockId: reference.targetArtifactBlockId,
      targetArtifactDate: reference.targetArtifactDate,

      // We trust the referenceText passed to us from the client.
      // Looking the reference text up here is very costly -- Instead, we should:
      // - Ensure the client has up-to-date referenceText at all times
      // - Update reference text when an artifact is updated
      referenceText: reference.referenceText,
    })),
  });
}
