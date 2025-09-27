import type { FilePurpose } from '@prisma/client';
import { trpc } from '../trpc';
import { FileStreamEncoder } from '@feynote/shared-utils';
import axios from 'axios';
import { getApiUrls } from '../getApiUrls';
import { appIdbStorageManager } from '../localDb/AppIdbStorageManager';

export const uploadFileToApi = async (args: {
  file: File;
  artifactId?: string;
  purpose: FilePurpose;
  onProgress?: (progress: number) => void;
}) => {
  const { id } = await trpc.file.getSafeFileId.query();

  const payload = await new FileStreamEncoder().encode({
    id,
    fileName: args.file.name,
    fileSize: args.file.size,
    mimetype: args.file.type,
    file: args.file,
    artifactId: args.artifactId,
    purpose: args.purpose,
  });

  const session = await appIdbStorageManager.getSession();

  const response = await axios.post(
    getApiUrls().trpc + '/file.createFile',
    payload,
    {
      headers: {
        'Content-Type': 'application/octet-stream',
        Authorization: session ? `Bearer ${session.token}` : undefined,
      },
      onUploadProgress: (event) => {
        args.onProgress?.(event.progress || 0);
      },
    },
  );

  // We're dealing with tRPC's custom response format here
  return response.data.result.data as Awaited<
    ReturnType<typeof trpc.file.createFile.mutate>
  >;
};
