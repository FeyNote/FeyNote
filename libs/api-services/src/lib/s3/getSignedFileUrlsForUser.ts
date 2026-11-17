import { FilePurpose } from '@prisma/client';
import { getSignedFileUrls } from './getSignedFileUrls';

export const getSignedFileUrlsForUser = async (
  userId: string,
): Promise<Map<string, string>> => {
  return getSignedFileUrls({
    userId,
    purpose: FilePurpose.artifact,
  });
};
