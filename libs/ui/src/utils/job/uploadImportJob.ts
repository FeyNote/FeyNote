import { trpc } from '../trpc';
import axios from 'axios';
import { getApiUrls } from '../getApiUrls';
import { appIdbStorageManager } from '../localDb/AppIdbStorageManager';
import { ImportJobStreamEncoder } from '@feynote/shared-utils';
import type { ImportFormat } from '@feynote/prisma/types';

export const uploadImportJob = async (args: {
  file: File;
  format: 'obsidian' | 'logseq' | 'docx';
  onProgress?: (progress: number) => void;
}) => {
  const { id } = await trpc.file.getSafeFileId.query();

  const payload = await new ImportJobStreamEncoder().encode({
    id,
    format: args.format as ImportFormat,
    fileName: args.file.name,
    fileSize: args.file.size,
    mimetype: args.file.type,
    file: args.file,
  });

  const session = await appIdbStorageManager.getSession();

  const response = await axios.post(
    getApiUrls().trpc + '/job.createImportJob',
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
    ReturnType<typeof trpc.job.createImportJob.mutate>
  >;
};
