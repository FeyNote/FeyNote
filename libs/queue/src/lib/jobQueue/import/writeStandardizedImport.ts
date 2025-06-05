import { prisma } from '@feynote/prisma/client';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import { uploadStandardizedMedia } from './uploadStandardizedMedia';
import { enqueueArtifactUpdate } from '../../artifactUpdateQueue/artifactUpdateQueue';
import { encodeStateAsUpdate, Doc as YDoc } from 'yjs';

export const writeStandardizedImport = async (
  importInfo: StandardizedImportInfo,
  userId: string,
) => {
  const images = await uploadStandardizedMedia(userId, importInfo);
  const { createdArtifacts } = await prisma.$transaction(async (tx) => {
    const createdArtifacts = await tx.artifact.createManyAndReturn({
      data: importInfo.artifactsToCreate,
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
      userId,
      triggeredByUserId: userId,
      oldReadableUserIds: [],
      newReadableUserIds: [userId],
      oldYBinB64: Buffer.from(encodeStateAsUpdate(new YDoc())).toString(
        'base64',
      ),
      newYBinB64: Buffer.from(artifact.yBin).toString('base64'),
    });
  }
};
