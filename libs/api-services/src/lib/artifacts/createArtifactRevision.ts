import { prisma } from '@feynote/prisma/client';
import { Prisma } from '@prisma/client';
import { getUserHasCapability } from '../payments/getUserHasCapability';
import { Capability } from '@feynote/shared-utils';

const REVISIONS_TO_KEEP = 10;
const REVISIONS_TO_KEEP_MORE = 25;

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

  const hasMoreRevisions = await getUserHasCapability(
    artifact.userId,
    Capability.MoreRevisions,
  );
  const revisionsToKeep = hasMoreRevisions
    ? REVISIONS_TO_KEEP_MORE
    : REVISIONS_TO_KEEP;
  const deleteP = tx.artifactRevision.deleteMany({
    where: {
      artifactId,
      revisionId: {
        lt: revisionId - revisionsToKeep,
      },
    },
  });

  await Promise.all([createP, deleteP]);
}
