import { prisma } from '@feynote/prisma/client';
import type { Prisma } from '@prisma/client';
import { getSignedUrlForFilePurpose } from './getSignedUrlForFilePurpose';

export const getSignedFileUrls = async (
  where: Prisma.FileWhereInput,
): Promise<Map<string, string>> => {
  const signedUrlByFileId = new Map<string, string>();
  const files = await prisma.file.findMany({
    where,
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
