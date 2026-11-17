import { FilePurpose } from '@prisma/client';
import { getSignedFileUrls } from './getSignedFileUrls';

export const getSignedFileUrlsForUserAndArtifacts = async (
  userId: string,
  artifactIds: string[],
): Promise<Map<string, string>> => {
  return getSignedFileUrls({
    purpose: FilePurpose.artifact,
    OR: [{ userId }, { artifactId: { in: artifactIds } }],
  });
};
