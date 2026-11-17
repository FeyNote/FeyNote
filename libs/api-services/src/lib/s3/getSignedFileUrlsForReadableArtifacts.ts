import { prisma } from '@feynote/prisma/client';
import { ArtifactAccessLevel, FilePurpose } from '@prisma/client';
import { getSignedUrlForFilePurpose } from './getSignedUrlForFilePurpose';

export const getSignedFileUrlsForReadableArtifacts = async (
  userId: string,
  exportedArtifactIds: string[],
): Promise<Map<string, string>> => {
  const signedUrlByFileId = new Map<string, string>();

  const ownedArtifactsPromise = prisma.artifact.findMany({
    where: { userId },
    select: { id: true },
  });
  const artifactSharesPromise = prisma.artifactShare.findMany({
    where: {
      userId,
      accessLevel: { not: ArtifactAccessLevel.noaccess },
    },
    select: { artifactId: true },
  });
  const [ownedArtifacts, artifactShares] = await Promise.all([
    ownedArtifactsPromise,
    artifactSharesPromise,
  ]);

  const readableArtifactIds = new Set(exportedArtifactIds);
  for (const artifact of ownedArtifacts) {
    readableArtifactIds.add(artifact.id);
  }
  for (const artifactShare of artifactShares) {
    readableArtifactIds.add(artifactShare.artifactId);
  }

  const files = await prisma.file.findMany({
    where: {
      purpose: FilePurpose.artifact,
      artifactId: { in: Array.from(readableArtifactIds) },
    },
    select: {
      id: true,
      storageKey: true,
      purpose: true,
    },
  });
  for (const file of files) {
    const presignedUrl = await getSignedUrlForFilePurpose({
      key: file.storageKey,
      operation: 'getObject',
      purpose: file.purpose,
      expiresInSeconds: 60 * 60 * 24 * 7, // 7 days
    });
    signedUrlByFileId.set(file.id, presignedUrl);
  }
  return signedUrlByFileId;
};
