import type { FilePurpose } from '@prisma/client';
import { trpc } from '../trpc';
import { encodeFileStream } from '@feynote/shared-utils';

export const uploadFileToApi = async (args: {
  file: File;
  artifactId?: string;
  purpose: FilePurpose;
}) => {
  const { id } = await trpc.file.getSafeFileId.query();

  const payload = await encodeFileStream({
    id,
    file: args.file,
    artifactId: args.artifactId,
    purpose: args.purpose,
  });

  const result = await trpc.file.createFile.mutate(payload);

  return result;
};
