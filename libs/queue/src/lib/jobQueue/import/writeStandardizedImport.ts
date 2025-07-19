import { prisma } from '@feynote/prisma/client';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import { uploadStandardizedMedia } from './uploadStandardizedMedia';
import { enqueueArtifactUpdate } from '../../artifactUpdateQueue/artifactUpdateQueue';
import { encodeStateAsUpdate, Doc as YDoc } from 'yjs';
import type { JobProgressTracker } from '../JobProgressTracker';
import type { JobSummary } from '@feynote/prisma/types';

export const writeStandardizedImport = async (args: {
  importInfo: StandardizedImportInfo;
  progressTracker: JobProgressTracker;
  job: JobSummary;
}) => {
  const images = await uploadStandardizedMedia(
    args.job.userId,
    args.importInfo,
    args.progressTracker,
  );
  const { createdArtifacts } = await prisma.$transaction(async (tx) => {
    const createdArtifacts = await tx.artifact.createManyAndReturn({
      data: args.importInfo.artifactsToCreate,
      select: {
        id: true,
        yBin: true,
      },
    });
    await tx.file.createMany({
      data: images,
    });

    return { createdArtifacts };
  });

  for (const artifact of createdArtifacts) {
    await enqueueArtifactUpdate({
      artifactId: artifact.id,
      userId: args.job.userId,
      triggeredByUserId: args.job.userId,
      oldYBinB64: Buffer.from(encodeStateAsUpdate(new YDoc())).toString(
        'base64',
      ),
      newYBinB64: Buffer.from(artifact.yBin).toString('base64'),
    });
  }
};
