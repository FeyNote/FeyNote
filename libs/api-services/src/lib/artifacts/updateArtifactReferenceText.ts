import { prisma } from "@feynote/prisma/client";
import { Prisma } from "@prisma/client";

/**
  * Updates the artifact reference text
  * Reference text is used for other artifacts to reference this one.
  */
export async function updateArtifactReferenceText(
  artifactId: string,
  oldTitle: string,
  newTitle: string,
  tx: Prisma.TransactionClient = prisma,
) {
  if (oldTitle !== newTitle) {
    await tx.artifactReferenceDisplayText.update({
      where: {
        artifactId,
      },
      data: {
        displayText: newTitle,
      }
    });
  }
}
