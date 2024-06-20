import { prisma } from '@feynote/prisma/client';
import { Prisma } from '@prisma/client';

/**
 * Updates the artifact title reference text
 * Title reference text is used for other artifacts to reference this one directly.
 */
export async function updateArtifactTitleReferenceText(
  artifactId: string,
  oldTitle: string,
  newTitle: string,
  tx: Prisma.TransactionClient = prisma,
) {
  if (oldTitle !== newTitle) {
    await tx.artifactReference.updateMany({
      where: {
        targetArtifactId: artifactId,
        targetArtifactBlockId: null,
      },
      data: {
        referenceText: newTitle,
      },
    });
  }
}
