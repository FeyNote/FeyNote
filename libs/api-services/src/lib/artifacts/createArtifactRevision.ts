import { prisma } from '@feynote/prisma/client';
import { Prisma } from '@prisma/client';

const REVISIONS_TO_KEEP = 10;

export async function createArtifactRevision(
  artifactId: string,
  tx: Prisma.TransactionClient = prisma,
) {
  const currentRevisionInfo = await tx.artifactRevision.aggregate({
    where: {
      artifactId,
    },
    orderBy: {
      revisionId: 'desc',
    },
    _max: {
      revisionId: true,
    },
  });

  const revisionId = (currentRevisionInfo._max.revisionId || 0) + 1;

  const artifact = await tx.artifact.findUniqueOrThrow({
    where: {
      id: artifactId,
    },
    include: {
      files: true,
    },
  });

  const artifactJson = {
    ...artifact,
    yBin: undefined,
    files: undefined,
    yBinBase64: Buffer.from(artifact.yBin).toString('base64'),
  };
  delete artifactJson.yBin;
  delete artifactJson.files;

  // TODO: validate if user can create revisions/if we nuke an old revision depending on sub level
  const createP = tx.artifactRevision.create({
    data: {
      artifactId: artifact.id,
      revisionId,
      userId: artifact.userId,
      artifactJson,
      artifactFilesJson: artifact.files,
      artifactDeletedAt: null,
    },
  });

  const deleteP = tx.artifactRevision.deleteMany({
    where: {
      artifactId,
      revisionId: {
        lt: revisionId - REVISIONS_TO_KEEP,
      },
    },
  });

  await Promise.all([createP, deleteP]);
}
