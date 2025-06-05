import { prisma } from '@feynote/prisma/client';
import { FilePurpose } from '@prisma/client';
import { getSignedUrlForFilePurpose } from './getSignedUrlForFilePurpose';

export const getSignedFileUrlsForUser = async (
  userId: string,
): Promise<Map<string, string>> => {
  const signedUrlByFileId = new Map<string, string>();
  const userFiles = await prisma.file.findMany({
    where: {
      userId,
      purpose: FilePurpose.artifact,
    },
    select: {
      id: true,
      storageKey: true,
      purpose: true,
    }
  });
  for (const file of userFiles) {
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
