import { prisma } from '@feynote/prisma/client';
import { FilePurpose } from '@prisma/client';
import { getSignedUrlForFilePurpose } from './getSignedUrlForFilePurpose';

export const getSignedFileUrlsForUser = async (
  userId: string,
): Promise<Map<string, string>> => {
  const userS3Map = new Map<string, string>();
  const userFiles = await prisma.file.findMany({
    where: {
      userId,
      purpose: FilePurpose.artifact,
    },
  });
  for (const file of userFiles) {
    const presignedUrl = await getSignedUrlForFilePurpose({
      key: file.storageKey,
      operation: 'getObject',
      purpose: FilePurpose.artifact,
      expiresInSeconds: 60 * 60 * 24 * 7, // 7 days
    });
    userS3Map.set(file.id, presignedUrl);
  }
  return userS3Map;
};
