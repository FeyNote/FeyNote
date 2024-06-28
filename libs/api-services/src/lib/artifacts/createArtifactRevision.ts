import { prisma } from '@feynote/prisma/client';
import { Prisma } from '@prisma/client';

export async function createArtifactRevision(
  artifactId: string,
  tx: Prisma.TransactionClient = prisma,
) {
  const currentRevision = await tx.artifactRevision.findFirst({
    where: {
      artifactId,
    },
    orderBy: {
      revisionId: 'desc',
    },
    select: {
      revisionId: true,
      artifactDeletedAt: true,
    },
  });
  const revisionId = (currentRevision?.revisionId || 0) + 1;

  const artifact = await tx.artifact.findUniqueOrThrow({
    where: {
      id: artifactId,
    },
  });

  // TODO: validate if user can create revisions/if we nuke an old revision depending on sub level
  await tx.artifactRevision.create({
    data: {
      artifactId: artifact.id,
      revisionId,
      userId: artifact.userId,
      artifactJson: artifact,
      artifactFilesJson: [],
      artifactDeletedAt: currentRevision?.artifactDeletedAt || null,
    },
  });
}
